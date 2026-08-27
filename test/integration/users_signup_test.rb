require "test_helper"

class UsersSignup < ActionDispatch::IntegrationTest
  def setup
    ActionMailer::Base.deliveries.clear
  end
end

class UsersSignupTest < UsersSignup
  test "valid signup information" do
    assert_difference "User.count", 1 do
      post users_path, params: { user: { name: "Example User",
                                         email: "user@example.com",
                                         password:              "password",
                                         password_confirmation: "password" } }
    end
    assert_equal 1, ActionMailer::Base.deliveries.size
    assert_not_nil assigns(:user).reload.activation_sent_at
  end

  test "invalid signup information" do
    get signup_path
    assert_no_difference "User.count" do
      post users_path, params: { user: { name: "",
                                         email: "user@invalid",
                                         password: "foo",
                                         password_confirmation: "bar" } }
    end
    assert_response :unprocessable_entity
    assert_select "div.field_with_errors"
  end

  test "user can resend activation email after initial delivery failure" do
    params = { user: { name: "Example User",
                       email: "delivery-failure@example.com",
                       password: "password",
                       password_confirmation: "password" } }

    delivery = Object.new
    delivery.define_singleton_method(:deliver_now) do
      raise Net::SMTPFatalError, "SMTP failed"
    end
    original_method = UserMailer.method(:account_activation)
    UserMailer.define_singleton_method(:account_activation) { |_user| delivery }

    begin
      assert_difference "User.count", 1 do
        post users_path, params: params
      end
    ensure
      UserMailer.define_singleton_method(:account_activation) do |*args|
        original_method.call(*args)
      end
    end

    user = User.find_by!(email: "delivery-failure@example.com")
    assert_redirected_to account_activation_resend_path
    assert_equal user.email, session[:activation_email]
    assert_nil user.activation_sent_at

    follow_redirect!
    assert_response :success
    assert_select ".alert", text: /アカウントの作成には成功しましたが/

    assert_difference "ActionMailer::Base.deliveries.size", 1 do
      post account_activation_resend_path
    end
    assert_redirected_to account_activation_resend_path
    assert_not_nil user.reload.activation_sent_at
  end

  test "unexpected activation email error is not rescued" do
    original_method = UserMailer.method(:account_activation)
    UserMailer.define_singleton_method(:account_activation) do |_user|
      raise ArgumentError, "programming error"
    end

    begin
      assert_raises(ArgumentError) do
        post users_path, params: { user: { name: "Example User",
                                           email: "unexpected-error@example.com",
                                           password: "password",
                                           password_confirmation: "password" } }
      end
    ensure
      UserMailer.define_singleton_method(:account_activation) do |*args|
        original_method.call(*args)
      end
    end
  end
end

class AccountActivationTest < UsersSignup
  def setup
    super
    post users_path, params: { user: { name:  "Example User",
                                       email: "user@example.com",
                                       password:              "password",
                                       password_confirmation: "password" } }
    @user = assigns(:user)
  end
  test "should not be activated" do
    assert_not @user.activated?
  end

  test "should not be able to log in before account activation" do
    log_in_as(@user)
    assert_not is_logged_in?
  end

  test "should not be able to log in with invalid activation token" do
    get edit_account_activation_path("invalid token", email: @user.email)
    assert_not is_logged_in?
  end

  test "should not be able to log in with invalid email" do
    get edit_account_activation_path(@user.activation_token, email: "wrong")
    assert_not is_logged_in?
  end

  test "should log in successfully with valid activation token and email" do
    get edit_account_activation_path(@user.activation_token, email: @user.email)
    assert @user.reload.activated?
    follow_redirect!
    assert is_logged_in?
  end
end
