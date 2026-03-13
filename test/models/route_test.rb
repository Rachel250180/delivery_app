require "test_helper"

class RouteTest < ActiveSupport::TestCase

  test "name shoule not be blank" do
    route = Route.new(name: "")
    assert_not route.save
  end

  test "name should not be too long" do
    route = Route.new(name: "a" *51)
    assert_not  route.valid?
  end

  test "should not save route without town_id" do
    route = Route.new(name: "test route", town_id: nil)
    assert_not route.save
  end
end
