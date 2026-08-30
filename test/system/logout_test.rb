# test/system/logout_test.rb

require "application_system_test_case"

class LogoutTest < ApplicationSystemTestCase
  test "user logs out" do
    user = users(:michael)

    visit login_path

    fill_in "session_email", with: user.email
    fill_in "session_password", with: "password"

    click_button "ログイン"
    assert_selector "body.users-show"

    click_link "ログアウト"

    assert_selector ".alert", text: I18n.t("flash.authentication.logout")
    assert_current_path(root_path)

    assert_text "ログイン"

    assert_no_link "ログアウト"
  end
end
