require "application_system_test_case"

class UsersSignupSystemTest < ApplicationSystemTestCase
  test "valid signup creates a user" do
    visit signup_path

    fill_in "user_name", with: "テストユーザー"
    fill_in "user_email", with: "test@example.com"
    fill_in "user_password", with: "password"
    fill_in "user_password_confirmation", with: "password"

    click_button "登録する"

    assert_selector "body.account_activation_resends-show"
    assert_current_path account_activation_resend_path
  end
end
