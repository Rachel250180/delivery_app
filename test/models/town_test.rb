require "test_helper"

class TownTest < ActiveSupport::TestCase
  test "name should not be blank" do
    town = Town.new(name: " ")
    assert_not town.valid?
  end

  test "name should not be too short" do
    town = Town.new(name: "aa")
    assert_not town.valid?
  end

  test "name should not be too long" do
    town = Town.new(name: "a" * 50)
    assert_not town.valid?
  end

  test "name should be unique" do
    Town.create!(name: "Ota")
    town = Town.new(name: "Ota")
    assert_not town.valid?
  end
end
