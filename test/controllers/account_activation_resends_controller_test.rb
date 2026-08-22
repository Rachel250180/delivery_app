require "test_helper"

class AccountActivationResendsControllerTest < ActionDispatch::IntegrationTest
  def setup
    Rails.cache.clear
    ActionMailer::Base.deliveries.clear
    post users_path, params: {
      user: {
        name: "Activation User",
        email: "activation@example.com",
        password: "password",
        password_confirmation: "password"
      }
    }
    @user = assigns(:user)
    ActionMailer::Base.deliveries.clear
  end

  test "recent activation email is not resent and digest is unchanged" do
    original_digest = @user.activation_digest

    assert_no_difference "ActionMailer::Base.deliveries.size" do
      post account_activation_resend_path
    end

    assert_equal original_digest, @user.reload.activation_digest
    assert_redirected_to account_activation_resend_path
  end

  test "activation email can be resent after five minutes" do
    @user.update_column(:activation_sent_at, 6.minutes.ago)
    original_digest = @user.activation_digest

    assert_difference "ActionMailer::Base.deliveries.size", 1 do
      post account_activation_resend_path
    end

    assert_not_equal original_digest, @user.reload.activation_digest
    assert_redirected_to account_activation_resend_path
  end
end
