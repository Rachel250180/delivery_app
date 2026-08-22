class PasswordResetRequest
  include ActiveModel::Model

  attr_accessor :email

  validates :email, presence: true,
                    length: { maximum: 255 },
                    format: { with: User::VALID_EMAIL_REGEX, allow_blank: true }

  def normalized_email
    email.to_s.strip.downcase
  end
end
