require "test_helper"

class RoutesControllerTest < ActionDispatch::IntegrationTest

  setup do
    @route = routes(:one)
  end

  test "should get index" do
    get routes_url
    assert_response :success
  end

  test "should get show" do
    get route_url(@route)
    assert_response :success
  end

  test "should get new" do
    get new_route_url
    assert_response :success
  end

  test "should get edit" do
    get edit_route_url(@route)
    assert_response :success
  end

#test create

  test "should create route" do
    assert_difference("Route.count", 1) do
      post routes_url, params: {route: {name:        "新しいルート",
                                        description: "説明",
                                        user_id:     @route.user_id} }
    end

    assert_redirected_to route_url(Route.last)
  end

  test "should not create route with invalid data" do
    assert_no_difference("Route.count") do
      post routes_url, params:{route: {name: "", description: ""}}
    end

    assert_response :unprocessable_entity
  end



  test "should update route" do
    patch route_url(@route),params: {route: {name: "更新ルート"}}
    assert_redirected_to route_url(@route)
  end

  test "should not update route with invalid data" do
    patch route_url(@route),params: {route: {name: ""}}
    assert_response :unprocessable_entity
  end

  test "should destroy route" do
    assert_difference("Route.count", -1) do
      delete route_url(@route)
    end

    assert_redirected_to routes_url
  end
end
