require "test_helper"

class UsersLoginTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:michael)
  end

  test "login with valid information" do
    get login_path
    assert_response :success
    post login_path, params: { session: { email: @user.email,
                                          password: "password" } }
    assert_redirected_to root_path
    follow_redirect!
    assert_response :success

    assert_equal @user.id, session[:user_id]
  end

  test "login with invalid information" do
    get login_path
    assert_response :success
    post login_path, params: { session: { email: "", password: "" } }
    assert_not is_logged_in?
    assert_response :unprocessable_entity
    assert_not flash.empty?
    get root_path
    assert flash.empty?
  end

  test "logout" do
   post login_path, params: { session: { email:    @user.email,
                                         password: "password" } }
    assert is_logged_in?
    assert_redirected_to root_path
    follow_redirect!
    assert_response :success
    delete logout_path
    assert_not is_logged_in?
    assert_response :see_other
    assert_redirected_to root_path
    # 2番目のウィンドウでログアウトをクリックするユーザーをシミュレートする
    delete logout_path
    assert_nil session[:user_id]
  end
end
