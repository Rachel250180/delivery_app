require "application_system_test_case"

class LoginTest < ApplicationSystemTestCase
  test "user logs in successfully" do
    user = users(:michael)

    visit login_path

    fill_in "session_email", with: user.email
    fill_in "session_password", with: "password"

    click_button "ログイン"

    assert_selector "body.users-show"
    assert_current_path(user_path(user))
    assert_text user.name
    assert_link "ログアウト"
  end
end
