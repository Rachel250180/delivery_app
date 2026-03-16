require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "should show user" do
    get user_url(@user)
    assert_response :success
  end

  test "should create town" do
    assert_difference("User.count") do
      post users_url params: {
                     user:   {
                     name: "michael",
                     email: "useful@example.com",
                     password: "password",
                     password_confirmation: "password"
                     }
      }
    end
    assert_redirected_to user_url(User.last)
  end
end
