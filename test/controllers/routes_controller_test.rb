require "test_helper"

class RoutesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @town = towns(:one)
    @route = routes(:one)
    @user = users(:michael)
    log_in_as(@user)
  end

  test "should get show" do
    get town_route_url(@town, @route)
    assert_response :success
  end

  test "should get new" do
    get new_town_route_url(@town)
    assert_response :success
  end

  test "should get edit" do
    get edit_town_route_url(@town, @route)
    assert_response :success
  end

  # create

  test "should create route" do
    assert_difference("Route.count", 1) do
      post town_routes_url(@town), params: {
        route: {
          name: "新しいルート",
          description: "説明"
        }
      }
    end

    assert_redirected_to town_route_url(@town, Route.last)
  end

  test "should not create route with invalid data" do
    assert_no_difference("Route.count") do
      post town_routes_url(@town), params: {
        route: { name: "", description: "" }
      }
    end

    assert_response :unprocessable_entity
  end

  test "should update route" do
    patch town_route_url(@town, @route), params: {
      route: { name: "更新ルート" }
    }

    assert_redirected_to town_route_url(@town, @route)
  end

  test "should not update route with invalid data" do
    patch town_route_url(@town, @route), params: {
      route: { name: "" }
    }

    assert_response :unprocessable_entity
  end

  test "should destroy route" do
    assert_difference("Route.count", -1) do
      delete town_route_url(@town, @route)
    end

    assert_redirected_to town_routes_url(@town)
  end
end
