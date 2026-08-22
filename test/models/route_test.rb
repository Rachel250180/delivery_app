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

  test "name should be unique within a town" do
    @route.save!
    duplicate = @route.dup
    duplicate.route_points.build(latitude: 35.1, longitude: 139.1, position: 0)

    assert_not duplicate.valid?
    assert duplicate.errors[:name].any?
  end

  test "same name should be valid in a different town" do
    @route.save!
    other_route = @route.dup
    other_route.town = towns(:two)
    other_route.route_points.build(latitude: 35.1, longitude: 139.1, position: 0)

    assert other_route.valid?
  end

  test "database enforces unique names within a town" do
    now = Time.current
    attributes = {
      name: "DB unique route",
      town_id: @town.id,
      user_id: @user.id,
      created_at: now,
      updated_at: now
    }

    Route.insert_all!([ attributes ])

    assert_raises ActiveRecord::RecordNotUnique do
      Route.insert_all!([ attributes ])
    end
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
