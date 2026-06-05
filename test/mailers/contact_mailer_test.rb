require "test_helper"

class ContactMailerTest < ActionMailer::TestCase
  test "contact_email" do
    mail = ContactMailer.contact_email(
      "michael",
      "test@example.com",
      "テストメッセージ"
    )

    assert_equal "お問い合わせが届きました。", mail.subject
    assert_equal [ ENV["GMAIL_ADDRESS"] || "test@example.com" ], mail.to
    assert_equal [ ENV["GMAIL_ADDRESS"] || "test@example.com" ], mail.from
    assert_equal [ "test@example.com" ], mail.reply_to

    body = mail.html_part&.body&.decoded || mail.text_part&.body&.decoded

    assert_match "michael", body
    assert_match "test@example.com", body
    assert_match "テストメッセージ", body
  end
end
