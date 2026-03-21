require "test_helper"

class RoutesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @town = towns(:one)
    @route = routes(:one)
    @user = users(:michael)
  end

  test "should get show" do
    get town_route_url(@town, @route)
    assert_response :success
  end

  test "should get new" do
    log_in_as(@user)
    get new_town_route_url(@town)
    assert_response :success
  end

  test "should redirect new when not logged in" do
    get new_town_route_url(@town)
    assert_redirected_to login_url
  end

  test "should get edit" do
    log_in_as(@user)
    get edit_town_route_url(@town, @route)
    assert_response :success
  end

  test "should redirect edit when not logged in" do
    get edit_town_route_url(@town, @route)
    assert_redirected_to login_url
  end

  test "should create route" do
    log_in_as(@user)
    assert_difference("Route.count", 1) do
      post town_routes_url(@town), params: {
                                route: { name: "新しいルート",
                                         description: "説明" } }
    end

    assert_redirected_to town_route_url(@town, Route.last)
  end

  test "should redirect create when not logged in" do
    post town_routes_url(@town), params: {
                                route: { name: "新しいルート",
                                         description: "説明" } }
    assert_redirected_to login_url
  end

  test "should update route" do
    log_in_as(@user)
    patch town_route_url(@town, @route), params: {
      route: { name: "更新ルート" }
    }

    assert_redirected_to town_route_url(@town, @route)
  end

  test "should redirect update when not logged in" do
    patch town_route_url(@town, @route), params: {
                                         route: { name: "更新ルート" } }
    assert_redirected_to login_url
  end

  test "should destroy route" do
    log_in_as(@user)
    assert_difference("Route.count", -1) do
      delete town_route_path(@town, @route)
    end

    assert_redirected_to town_routes_url(@town)
  end

  test "should redirect destroy when not logged in" do
    delete town_route_path(@town, @route)
    assert_redirected_to login_url
  end
end
