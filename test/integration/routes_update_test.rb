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

    @route.reload

    assert_equal("更新後ルート", @route.name)
    assert_equal(1, @route.route_points.count)
    assert_equal("大阪", @route.route_points.first.address)
  end
end
