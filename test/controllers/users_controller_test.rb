require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user =  users(:michael)
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

  test "should redirect edit when not logged in" do
    get edit_user_path(@user)
    assert_not flash.empty?
    assert_redirected_to login_url
  end

  test "should redirect update when not logged in" do
    patch user_path(@user), params: { user: { name: @user.name,
                                              email: @user.email } }
    assert_not flash.empty?
    assert_redirected_to login_url
  end

  test "should redirect destroy when logged in" do
    assert_no_difference "User.count" do
      delete user_path(@user)
    end
    assert_response :see_other
    assert_redirected_to login_url
  end
end
