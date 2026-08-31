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

  test "estimated duration must not be negative" do
    @route.estimated_duration = -1

    assert_not @route.valid?
  end

  test "estimated duration allows zero" do
    @route.estimated_duration = 0

    assert @route.valid?
  end

  test "estimated duration allows nil" do
    @route.estimated_duration = nil

    assert @route.valid?
  end

  test "estimated duration allows a positive integer" do
    @route.estimated_duration = 31

    assert @route.valid?
  end

  test "estimated duration rejects a decimal value" do
    @route.estimated_duration = 1.5

    assert_not @route.valid?
  end

  test "database rejects a negative estimated duration" do
    now = Time.current

    assert_raises ActiveRecord::StatementInvalid do
      Route.insert_all!([ {
        name: "Negative duration route",
        estimated_duration: -1,
        town_id: @town.id,
        user_id: @user.id,
        created_at: now,
        updated_at: now
      } ])
    end
  end

  test "database rejects a null route name" do
    assert_raises ActiveRecord::NotNullViolation do
      routes(:one).update_column(:name, nil)
    end
  end

  test "routes have an index on user id" do
    assert ActiveRecord::Base.connection.index_exists?(
      :routes,
      :user_id,
      name: "index_routes_on_user_id"
    )
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

  test "allows multiple non-representative routes in the same town" do
    @route.save!
    another_route = build_route(name: "Another Route")

    assert another_route.save
  end

  test "allows one representative route in a town" do
    @route.representative = true

    assert @route.save
  end

  test "does not allow a second representative route in the same town" do
    @route.update!(representative: true)
    another_route = build_route(name: "Another Route", representative: true)

    assert_not another_route.valid?
    assert another_route.errors[:representative].any?
  end

  test "allows one representative route in each town" do
    @route.update!(representative: true)
    other_route = build_route(
      name: "Other Town Route",
      town: towns(:two),
      representative: true
    )

    assert other_route.save
  end

  test "database enforces one representative route per town" do
    @route.update!(representative: true)
    now = Time.current

    assert_raises ActiveRecord::RecordNotUnique do
      Route.insert_all!([ {
        name: "Second Representative Route",
        representative: true,
        town_id: @town.id,
        user_id: @user.id,
        created_at: now,
        updated_at: now
      } ])
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

  private

  def build_route(name:, town: @town, representative: false)
    route = Route.new(
      name: name,
      user: @user,
      town: town,
      representative: representative
    )
    route.route_points.build(
      latitude: 35.0,
      longitude: 139.0,
      position: 0
    )
    route
  end
end
