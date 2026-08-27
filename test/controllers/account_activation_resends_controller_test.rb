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

  test "activation email delivery failure keeps resend available" do
    @user.update_column(:activation_sent_at, 6.minutes.ago)

    delivery = Object.new
    delivery.define_singleton_method(:deliver_now) do
      raise Net::SMTPFatalError, "SMTP failed"
    end
    original_method = UserMailer.method(:account_activation)
    UserMailer.define_singleton_method(:account_activation) { |_user| delivery }

    begin
      post account_activation_resend_path
    ensure
      UserMailer.define_singleton_method(:account_activation) do |*args|
        original_method.call(*args)
      end
    end

    assert_redirected_to account_activation_resend_path
    assert_equal @user.email, session[:activation_email]

    follow_redirect!
    assert_response :success
    assert_select ".alert", text: /認証メールの送信に失敗しました/

    assert_difference "ActionMailer::Base.deliveries.size", 1 do
      post account_activation_resend_path
    end
    assert_redirected_to account_activation_resend_path
    assert_not_nil @user.reload.activation_sent_at
  end
end
