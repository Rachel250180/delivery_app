# test/integration/routes_update_test.rb

require "test_helper"

class RoutesUpdateTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:michael)
    @town = towns(:one)
    @route = routes(:one)

    log_in_as(@user)
  end

  test "update route and replace route points" do
    points = [
      {
        lat: 36.0,
        lng: 140.0,
        address: "大阪"
      }
    ]

    patch town_route_path(@town, @route),
      params: {
        route: { name: "更新後ルート" },
                 points_json: points.to_json }

    assert_redirected_to(
      town_route_path(@town, @route))
    assert_equal I18n.t("flash.routes.updated"), flash[:notice]

    @route.reload

    assert_equal("更新後ルート", @route.name)
    assert_equal(1, @route.route_points.count)
    assert_equal("大阪", @route.route_points.first.address)
  end

  test "rejects an update with more than the configured maximum route points" do
    points = (Route::MAX_ROUTE_POINTS + 1).times.map do |i|
      { lat: i, lng: i, address: "地点#{i}" }
    end

    original_name = @route.name

    patch town_route_path(@town, @route),
      params: {
        route: { name: "更新後ルート" },
        points_json: points.to_json
      }

    assert_response :unprocessable_entity

    @route.reload
    assert_equal original_name, @route.name
    assert_equal 1, @route.route_points.count
  end

  test "rejects malformed points json without changing the route" do
    original_name = @route.name

    patch town_route_path(@town, @route),
          params: {
            route: { name: "更新後ルート" },
            points_json: "{invalid"
          }

    assert_response :unprocessable_entity
    assert_select "#error_explanation", text: /形式が正しくありません/
    assert_equal original_name, @route.reload.name
  end
end
