require "test_helper"

class RoutesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get routes_url
    assert_response :success
  end

  test "should get show" do
    route = Route.create!(name: "テスト", description: "説明", user_id: 1)
    get route_url(route)
    assert_response :success
  end

  test "should get new" do
    get new_route_url
    assert_response :success
  end
end
