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
end
