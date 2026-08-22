require "test_helper"

class PasswordResetRequestTest < ActiveSupport::TestCase
  test "validates presence and format" do
    assert_not PasswordResetRequest.new(email: " ").valid?
    assert_not PasswordResetRequest.new(email: "abc").valid?
    assert PasswordResetRequest.new(email: "USER@example.com").valid?
  end

  test "normalizes email" do
    request = PasswordResetRequest.new(email: " USER@Example.COM ")

    assert_equal "user@example.com", request.normalized_email
  end
end
