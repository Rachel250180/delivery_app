require "test_helper"

class RoutePointLimitTest < ActiveSupport::TestCase
  test "rejects more route points than the configured maximum" do
    route = Route.new(
      name: "地点数のテスト",
      user: users(:michael),
      town: towns(:one)
    )

    (Route::MAX_ROUTE_POINTS + 1).times do |position|
      route.route_points.build(
        latitude: position,
        longitude: position,
        position: position
      )
    end

    assert_not route.valid?
    assert_includes route.errors[:route_points],
                    "は#{Route::MAX_ROUTE_POINTS}個までしか登録できません"
  end
end
