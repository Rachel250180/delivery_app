require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.new(name: "Example User",
                     email: "user@example.com",
                     password: "password",
                     password_confirmation: "password")
  end

  test "should be valid" do
    assert @user.valid?
  end

  test "database rejects null values for required user columns" do
    user = users(:michael)

    %i[name email password_digest admin activated].each do |column|
      assert_raises ActiveRecord::NotNullViolation do
        User.transaction(requires_new: true) do
          user.update_column(column, nil)
        end
      end
    end
  end

  test "name should be present" do
    @user.name = "   "
    assert_not @user.valid?
  end

  test "email should be present" do
    @user.email = "   "
    assert_not @user.valid?
  end

  test "name should not be too long" do
    @user.name = "a" * 51
    assert_not @user.valid?
  end

  test "email should not be too long" do
    @user.email = "a" * 244 + "@example.com"
    assert_not @user.valid?
  end

  test "email validation should accept valid addresses" do
    valid_adresses = %w[user@example.com USER@foo.COM A_US-ER@foo.bar.org
                         first.last@foo.jp alice+bob@baz.cn]
    valid_adresses.each do |valid_address|
      @user.email = valid_address
      assert @user.valid?, "#{valid_address.inspect} should be vaild"
    end
  end

  test "email validation should reject invalid addresses" do
    invalid_addresses = %w[user@example,com user_at_foo.org user.name@example.
                           foo@bar_baz.com foo@bar+baz.com]
    invalid_addresses.each do |invalid_address|
      @user.email = invalid_address
      assert_not @user.valid?, "#{invalid_address.inspect} should be invalid"
    end
  end

  test "email address should be unique (case insensitive)" do
    duplicate_user = @user.dup
    duplicate_user.email = @user.email.upcase
    @user.save
    assert_not duplicate_user.valid?
  end

  test "email addresses should be saved as lowercase" do
    mixed_case_email = "Foo@ExAMPle.CoM"
    @user.email = mixed_case_email
    @user.save
    assert_equal mixed_case_email.downcase, @user.reload.email
  end

  test "password should be present (nonblank)" do
    @user.password = @user.password_confirmation = " " * 8
    assert_not @user.valid?
  end

  test "password should have a minimum length" do
    @user.password = @user.password_confirmation ="a" * 7
    assert_not @user.valid?
  end

  test "authenticate should return false for user with nil digest" do
    assert_not @user.authenticated?(:remember, "")
  end

  test "password confirmation should match password" do
    @user.password_confirmation = "different"
    assert_not @user.valid?
  end

  test "successful activation email records sent time" do
    @user.save!

    assert_changes -> { @user.reload.activation_sent_at }, from: nil do
      @user.send_activation_email
    end
  end

  test "failed activation email does not record sent time" do
    @user.save!
    delivery = Object.new
    delivery.define_singleton_method(:deliver_now) { raise "SMTP failed" }
    original_method = UserMailer.method(:account_activation)
    UserMailer.define_singleton_method(:account_activation) { |_user| delivery }

    begin
      assert_raises(RuntimeError) { @user.send_activation_email }
    ensure
      UserMailer.define_singleton_method(:account_activation) do |*args|
        original_method.call(*args)
      end
    end

    assert_nil @user.reload.activation_sent_at
  end

  test "recent activation email prevents token and digest regeneration" do
    @user.save!
    @user.activation_token = "existing-token"
    @user.update_columns(
      activation_digest: User.digest(@user.activation_token),
      activation_sent_at: 1.minute.ago
    )
    original_digest = @user.activation_digest

    assert_not @user.resend_activation_email
    assert_equal "existing-token", @user.activation_token
    assert_equal original_digest, @user.reload.activation_digest
  end

  test "activation email can be resent after the interval" do
    @user.save!
    @user.update_column(:activation_sent_at, 6.minutes.ago)
    original_digest = @user.activation_digest

    assert @user.resend_activation_email
    assert_not_equal original_digest, @user.reload.activation_digest
    assert @user.activation_sent_at > 1.minute.ago
  end

  test "recent password reset is detected for five minutes" do
    @user.reset_sent_at = 1.minute.ago
    assert @user.password_reset_recently_sent?

    @user.reset_sent_at = 6.minutes.ago
    assert_not @user.password_reset_recently_sent?
  end
end
