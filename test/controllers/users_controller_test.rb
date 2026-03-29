require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user =  users(:michael)
    @other_user = users(:archer)
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

  test "should not create user with invalid data" do
    assert_no_difference("User.count") do
      post users_url, params: {
                      user: { name: "",
                              email: "invalid",
                              password: "foo",
                              password_confirmation: "bar" } }
    end

    assert_response :unprocessable_entity
  end

  test "should edit user" do
    log_in_as(@user)
    get edit_user_path(@user)
    assert_response :success
  end

  test "should redirect edit when not logged in" do
    get edit_user_path(@user)
    assert_not flash.empty?
    assert_redirected_to login_url
  end

  test "should redirect edit when logged in as wrong user" do
    log_in_as(@other_user)
    get edit_user_path(@user)
    assert flash.empty?
    assert_redirected_to root_url
  end

  test "should update user" do
    log_in_as(@user)
    patch user_path(@user), params: {
                            user: { name: "new",
                                    email: "new@example.com",
                                    password: "password",
                                    password_confirmation: "password" } }
    assert_redirected_to user_url(@user)
  end

  test "should not update user with invalid data" do
    log_in_as(@user)

    patch user_path(@user), params: { user: { name: "",
                                              email: "invalid" } }
    assert_response :unprocessable_entity
  end

  test "should redirect update when not logged in" do
    patch user_path(@user), params: { user: { name: @user.name,
                                              email: @user.email } }
    assert_not flash.empty?
    assert_redirected_to login_url
  end

  test "should redirect update when logged in as wrong user" do
    log_in_as(@other_user)
    patch user_path(@user), params: { user: { name: @user.name,
                                              email: @user.email } }
    assert flash.empty?
    assert_redirected_to root_url
  end

  test "should destroy user" do
    log_in_as(@user)
    assert_difference("User.count", -1) do
      delete user_path(@user)
    end
    assert_redirected_to users_url
  end

  test "should redirect destroy when not logged in" do
    assert_no_difference "User.count" do
      delete user_path(@user)
    end
    assert_response :see_other
    assert_redirected_to login_url
  end

test "should redirect destroy when logged in as a non-admin" do
  log_in_as(@other_user)
  assert_no_difference "User.count" do
    delete user_path(@user)
  end
  assert_response :see_other
  assert_redirected_to root_url
end

  test "should not allow the admin attribute to be edited via the web" do
    log_in_as(@pther_user)
    assert_not @other_user.admin?
    patch user_path(@other_user), params: {
                                  user:   { password:              "password",
                                            password_confirmation: "password",
                                            admin:                 "true" } }
    assert_not @other_user.reload.admin?
  end
end
