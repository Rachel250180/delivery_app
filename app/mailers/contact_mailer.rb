class ContactMailer < ApplicationMailer
default to: Rails.application.credentials.contact_email

  def contact_email(name, email, message)
    @name = name
    @message = message
    @email = email

    mail(
      subject: "お問い合わせが届きました。",
      reply_to: email
    )
  end
end
