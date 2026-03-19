require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:michael)
  end

  test "should show user" do
    get user_url(@user)
    assert_response :success
  end

  test "should get new" do
    get new_user_path
    assert_response :success
  end

  test "should create user" do
    assert_difference("User.count") do
      post users_url, params: {
                      user:   {
                      name: "michael",
                      email: "test@example.com",
                      password: "password",
                      password_confirmation: "password"
                      }
      }
    end
    assert_redirected_to user_url(User.last)
  end
end
