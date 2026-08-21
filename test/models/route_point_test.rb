require "test_helper"

class RoutePointTest < ActiveSupport::TestCase
  def setup
    @route_point = RoutePoint.new(
      route: routes(:one),
      latitude: 35.0,
      longitude: 139.0,
      address: "東京都",
      position: 0
    )
  end

  test "is valid with valid attributes" do
    assert @route_point.valid?
  end

  test "requires latitude within its valid range" do
    [ nil, -91, 91 ].each do |latitude|
      @route_point.latitude = latitude
      assert_not @route_point.valid?
      assert @route_point.errors[:latitude].any?
    end
  end

  test "requires longitude within its valid range" do
    [ nil, -181, 181 ].each do |longitude|
      @route_point.longitude = longitude
      assert_not @route_point.valid?
      assert @route_point.errors[:longitude].any?
    end
  end

  test "requires a non-negative integer position" do
    [ nil, -1, 1.5 ].each do |position|
      @route_point.position = position
      assert_not @route_point.valid?
      assert @route_point.errors[:position].any?
    end
  end

  test "requires position to be unique within a route" do
    @route_point.save!
    duplicate = @route_point.dup

    assert_not duplicate.valid?
    assert duplicate.errors[:position].any?
  end

  test "allows the same position in different routes" do
    @route_point.save!
    other_route_point = @route_point.dup
    other_route_point.route = routes(:two)

    assert other_route_point.valid?
  end

  test "limits address length" do
    @route_point.address = "あ" * (RoutePoint::MAX_ADDRESS_LENGTH + 1)

    assert_not @route_point.valid?
    assert @route_point.errors[:address].any?
  end
end
