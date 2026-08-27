class ApplicationMailer < ActionMailer::Base
  DELIVERY_ERRORS = [
    Net::SMTPError,
    SocketError,
    Timeout::Error,
    IOError,
    Errno::ECONNREFUSED,
    Errno::ECONNRESET,
    Errno::EHOSTUNREACH,
    Errno::ENETUNREACH,
    Errno::ETIMEDOUT,
    Errno::EPIPE,
    OpenSSL::SSL::SSLError
  ].freeze

  default from: ENV["MAIL_FROM"] || "test@example.com"
  layout "mailer"
end
