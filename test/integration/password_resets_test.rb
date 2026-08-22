require "test_helper"

class PasswordResets < ActionDispatch::IntegrationTest
  def setup
    Rails.cache.clear
    ActionMailer::Base.deliveries.clear
    @user = users(:michael)
  end
end

class ForgotPasswordFormTest < PasswordResets
  test "password reset path" do
    get new_password_reset_path
    assert_select "h1", "パスワードを再設定"
    assert_select "input[name=?]", "password_reset[email]"
  end

  test "blank email is rejected" do
    post password_resets_path, params: { password_reset: { email: " " } }
    assert_response :unprocessable_entity
    assert_select "h1", "パスワードを再設定"
    assert_select "div#error_explanation", /メールアドレスを入力してください/
  end

  test "invalid email format is rejected" do
    post password_resets_path, params: { password_reset: { email: "abc" } }
    assert_response :unprocessable_entity
    assert_select "h1", "パスワードを再設定"
    assert_select "div#error_explanation", /メールアドレスは不正な値です/
  end

  test "registered and unregistered emails have the same response" do
    post password_resets_path,
         params: { password_reset: { email: @user.email } }
    registered_status = response.status
    registered_location = response.location
    registered_message = flash[:notice]

    ActionMailer::Base.deliveries.clear
    post password_resets_path,
         params: { password_reset: { email: "missing@example.com" } }

    assert_equal registered_status, response.status
    assert_equal registered_location, response.location
    assert_equal registered_message, flash[:notice]
    assert_empty ActionMailer::Base.deliveries
  end
end

class PasswordResetForm < PasswordResets
  def setup
    super
    @user = users(:michael)
    post password_resets_path,
         params: { password_reset: { email: @user.email } }
    @reset_user = assigns(:user)
  end
end

class PasswordFormTest < PasswordResetForm
  test "reset with valid email" do
    assert_not_equal @user.reset_digest, @reset_user.reset_digest
    assert_equal 1, ActionMailer::Base.deliveries.size
    assert_not flash.empty?
    assert_redirected_to root_url
  end

  test "reset with inactive user" do
    @reset_user.toggle!(:activated)
    get edit_password_reset_path(@reset_user.reset_token,
                                 email: @reset_user.email)
    assert_redirected_to root_url
  end

  test "reset with right email but wrong token" do
    get edit_password_reset_path("wrong token", email: @reset_user.email)
    assert_redirected_to root_url
  end

  test "reset with right email and right token" do
    get edit_password_reset_path(@reset_user.reset_token,
                                 email: @reset_user.email)
    assert_select "input[name=email][type=hidden][value=?]", @reset_user.email
  end
end

class PasswordResetResendTest < PasswordResets
  test "recent request keeps digest and does not resend" do
    post password_resets_path,
         params: { password_reset: { email: @user.email } }
    @user.reload
    original_digest = @user.reset_digest
    original_sent_at = @user.reset_sent_at
    first_status = response.status
    first_location = response.location
    first_message = flash[:notice]
    ActionMailer::Base.deliveries.clear

    post password_resets_path,
         params: { password_reset: { email: @user.email } }

    assert_equal first_status, response.status
    assert_equal first_location, response.location
    assert_equal first_message, flash[:notice]
    assert_empty ActionMailer::Base.deliveries
    assert_equal original_digest, @user.reload.reset_digest
    assert_equal original_sent_at, @user.reset_sent_at
  end

  test "request can be resent after five minutes" do
    post password_resets_path,
         params: { password_reset: { email: @user.email } }
    original_digest = @user.reload.reset_digest
    @user.update_column(:reset_sent_at, 6.minutes.ago)
    ActionMailer::Base.deliveries.clear

    assert_difference "ActionMailer::Base.deliveries.size", 1 do
      post password_resets_path,
           params: { password_reset: { email: @user.email } }
    end

    assert_not_equal original_digest, @user.reload.reset_digest
    assert_redirected_to root_url
  end

  test "email rate limit returns too many requests" do
    3.times do
      post password_resets_path,
           params: { password_reset: { email: @user.email } }
      assert_redirected_to root_url
    end

    post password_resets_path,
         params: { password_reset: { email: @user.email } }

    assert_response :too_many_requests
  end
end

class PasswordUpdateTest < PasswordResetForm
  test "update with invalid password and confirmation" do
    patch password_reset_path(@reset_user.reset_token),
          params: { email: @reset_user.email,
                    user: { password:              "foobaz",
                            password_confirmation: "barquux" } }
    assert_select "div#error_explanation"
  end

  test "update with empty password" do
    patch password_reset_path(@reset_user.reset_token),
          params: { email: @reset_user.email,
                    user: { password:              "",
                            password_confirmation: "" } }
    assert_select "div#error_explanation"
  end

  test "update with valid password and confirmation" do
    patch password_reset_path(@reset_user.reset_token),
          params: { email: @reset_user.email,
                    user: { password:              "password",
                            password_confirmation: "password" } }
    assert is_logged_in?
    assert @user.reset_digest.nil?
    assert_not flash.empty?
    assert_redirected_to @reset_user
  end
end

class ExpiredToken < PasswordResets
  def setup
    super
    post password_resets_path,
        params: { password_reset: { email: @user.email } }
    @reset_user = assigns(:user)
    @reset_user.update_attribute(:reset_sent_at, 3.hours.ago)
    patch password_reset_path(@reset_user.reset_token),
          params: { email: @reset_user.email,
                    user: { password:              "password",
                            password_confirmation: "password" } }
  end
end

class ExpiredTokenTest < ExpiredToken
  test "should redirect to the password-reset page" do
    assert_redirected_to new_password_reset_url
  end

  test "should include the word 'expired' on the password-reset page" do
    follow_redirect!
    assert_match "期限", response.body
  end
end
