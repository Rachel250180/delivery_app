require "test_helper"

class UserMailerTest < ActionMailer::TestCase
  test "account_activation" do
    user = users(:michael)
    user.activation_token = User.new_token
    mail = UserMailer.account_activation(user)

    assert_equal "アカウント認証", mail.subject
    assert_equal [ user.email ], mail.to
    assert_equal [ ENV.fetch("MAIL_FROM", "test@example.com") ], mail.from

    assert_match user.name, mail.text_part.body.decoded
    assert_match user.activation_token, mail.text_part.body.decoded
    assert_match CGI.escape(user.email), mail.text_part.body.decoded
  end

  test "password reset" do
    user = users(:michael)
    user.reset_token = User.new_token
    mail = UserMailer.password_reset(user)

    assert_equal "パスワード再設定", mail.subject
    assert_equal [ user.email ], mail.to
    assert_equal [ ENV.fetch("MAIL_FROM", "test@example.com") ], mail.from

    assert_match user.reset_token, mail.text_part.body.decoded
    assert_match CGI.escape(user.email), mail.text_part.body.decoded
  end
end
