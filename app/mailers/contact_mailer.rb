class ContactMailer < ApplicationMailer
  def contact_email(name, email, message)
    @name = name
    @email = email
    @message = message

    mail(
      to: ENV["CONTACT_EMAIL"] || "test@example.com",
      reply_to: email,
      subject: "お問い合わせが届きました。"
    )
  end
end
