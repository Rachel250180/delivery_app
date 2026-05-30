# test/integration/routes_create_test.rb

require "test_helper"

class RoutesCreateTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:michael)
    @town = towns(:one)

    log_in_as(@user)
  end

  test "create route with route points" do
    points = [
      {
        lat: 35.1,
        lng: 139.1,
        address: "東京都"
      },
      {
        lat: 35.2,
        lng: 139.2,
        address: "神奈川県"
      }
    ]

    assert_difference "Route.count", 1 do
      assert_difference "RoutePoint.count", 2 do
        post town_routes_path(@town),
             params: {
               route: {
                 name: "配送ルートA",
                 description: "テスト"
               },
               points_json: points.to_json
             }
      end
    end

    route = Route.last

    assert_equal @user, route.user

    assert_redirected_to(
      town_route_path(@town, route)
    )
  end
end
