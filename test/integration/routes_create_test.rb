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

  test "should reject more than 9 route points" do
    points = []

    10.times do |i|
      points << {
        lat: i,
        lng: i,
        address: "test#{i}"
      }
    end

    assert_no_difference "Route.count" do
      post town_routes_path(@town),
          params: {
            route: {
              name: "配送ルートA"
            },
            points_json: points.to_json
          }
    end

    assert_response :unprocessable_entity
  end

  test "rejects a route without route points" do
    assert_no_difference [ "Route.count", "RoutePoint.count" ] do
      post town_routes_path(@town),
           params: {
             route: { name: "配送ルートA" },
             points_json: [].to_json
           }
    end

    assert_response :unprocessable_entity
    assert_select "#error_explanation", text: /1個以上登録してください/
  end

  test "rejects malformed points json with a user-facing error" do
    assert_no_difference [ "Route.count", "RoutePoint.count" ] do
      post town_routes_path(@town),
           params: {
             route: { name: "配送ルートA" },
             points_json: "{invalid"
           }
    end

    assert_response :unprocessable_entity
    assert_select "#error_explanation", text: /形式が正しくありません/
    assert_select "#route-data[data-map-mode='new']"
    assert_select "script[data-google-maps-script]", count: 1
  end

  test "rejects points json that is not an array" do
    assert_no_difference [ "Route.count", "RoutePoint.count" ] do
      post town_routes_path(@town),
           params: {
             route: { name: "配送ルートA" },
             points_json: { lat: 35.0, lng: 139.0 }.to_json
           }
    end

    assert_response :unprocessable_entity
  end

  test "rejects coordinates outside their valid ranges" do
    points = [ { lat: 91, lng: 181, address: "不正地点" } ]

    assert_no_difference [ "Route.count", "RoutePoint.count" ] do
      post town_routes_path(@town),
           params: {
             route: { name: "配送ルートA" },
             points_json: points.to_json
           }
    end

    assert_response :unprocessable_entity
  end
end
