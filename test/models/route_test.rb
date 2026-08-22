require "test_helper"
class RouteTest < ActiveSupport::TestCase
  def setup
    @user = users(:michael)
    @town = towns(:one)
    @route = Route.new(
      name: "Test Route",
      description: "Test description",
      user: @user,
      town: @town
    )
    @route.route_points.build(
      latitude: 35.0,
      longitude: 139.0,
      position: 0
    )
  end

  test "should be valid" do
    assert @route.valid?
  end

  test "name shoule not be blank" do
    @route.name = " "
    assert_not @route.valid?
  end

  test "name should not be too short" do
    @route.name = "aa"
    assert_not @route.valid?
  end

  test "name should not be too long" do
    @route.name = "a" * 51
    assert_not @route.valid?
  end

  test "should not be valid without user" do
    @route.user = nil
    assert_not @route.valid?
  end

  test "should not be valid without town" do
    @route.town = nil
    assert_not @route.valid?
  end

  test "should not be valid without route points" do
    @route.route_points.clear

    assert_not @route.valid?
    assert_includes @route.errors[:route_points],
                    "を#{Route::MIN_ROUTE_POINTS}個以上登録してください"
  end

  test "routes should be destroyed with user" do
    @route.save

    assert_difference "Route.count", -2 do
      @user.destroy
    end
  end

  test "routes should be destroyed with town" do
    @route.save

    assert_difference "Route.count", -2 do
      @town.destroy
    end
  end
end
