class User < ApplicationRecord
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  attr_accessor :remember_token, :activation_token, :reset_token

  has_many      :routes, dependent: :destroy
  before_save   :downcase_email
  before_create :create_activation_digest

  has_secure_password
  validates :name,    presence: true,  length: { maximum: 50 }
  validates :email,   presence: true,  length: { maximum: 255 },
                                       uniqueness: { case_sensitive: false },
                                       format: { with: VALID_EMAIL_REGEX }
  validates :password, presence: true, length: { minimum: 8 },
                                       allow_nil: true

  class << self
    def digest(string)
      cost = ActiveModel::SecurePassword.min_cost ? BCrypt::Engine::MIN_COST :
                                                    BCrypt::Engine.cost
      BCrypt::Password.create(string, cost: cost)
    end

    def new_token
      SecureRandom.urlsafe_base64
    end

    def guest
      find_or_create_by!(email: "guest@example.com") do |user|
        user.name                  = "ゲストユーザー"
        user.password              = "password"
        user.password_confirmation = "password"
        user.admin                 = false
        user.activated             = true
        user.activated_at          = Time.zone.now
      end
    end
  end

  def remember
    self.remember_token = User.new_token
    update_attribute(:remember_digest, User.digest(remember_token))
    remember_digest
  end

  def session_token
    remember_digest || remember
  end

  def authenticated?(attribute, token)
    digest = public_send("#{attribute}_digest")
    return false if digest.nil?
    BCrypt::Password.new(digest).is_password?(token)
  end

  # ユーザーのログイン情報を破棄する
  def forget
    update_attribute(:remember_digest, nil)
  end

  def activate
    update_columns(activated: true, activated_at: Time.zone.now)
  end

  def send_activation_email
    UserMailer.account_activation(self).deliver_now
  end

  def create_reset_digest
    self.reset_token = User.new_token
    update_columns(reset_digest: User.digest(reset_token), reset_sent_at: Time.zone.now)
  end

  def send_password_reset_email
    UserMailer.password_reset(self).deliver_now
  end

  def password_reset_expired?
    reset_sent_at < 2.hours.ago
  end

  def guest?
    email == "guest@example.com"
  end

  def resend_activation_email
    self.activation_token = User.new_token
    self.activation_digest = User.digest(activation_token)
    save!(validate: false)
    send_activation_email
  end

  private

    def downcase_email
      self.email = email.downcase
    end

    def create_activation_digest
      self.activation_token = User.new_token
      self.activation_digest = User.digest(activation_token)
    end
end
