class ApplicationMailer < ActionMailer::Base
default from: ENV["MAIL_FROM"] || "test@example.com"
  layout "mailer"
end
