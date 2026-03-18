require "test_helper"

class UsersLoginTest < ActionDispatch::IntegrationTest
  test "login with invalid information" do
    get login_path
    assert_no_difference "session.count" do
      post login_path, params: { session: { email: " ", password: " " } }
    end
    assert_response :unprocessable_entity
    assert_not flash.empty?
    get root_path
  end
end