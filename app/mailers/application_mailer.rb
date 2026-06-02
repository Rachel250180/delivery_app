class ApplicationMailer < ActionMailer::Base
default from: ENV["GMAIL_ADDRESS"] || "test@example.com"
  layout "mailer"
end
