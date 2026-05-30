require "application_system_test_case"

class LoginTest < ApplicationSystemTestCase
  test "user logs in successfully" do
    user = users(:michael)
    visit login_path

    fill_in "Email", with: user.email
    fill_in "Password", with: "password"
    click_button "Log in"

    assert_current_path(
      user_path(user)
    )
  end
end
