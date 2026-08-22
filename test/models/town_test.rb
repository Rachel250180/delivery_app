require "test_helper"

class TownTest < ActiveSupport::TestCase
  test "name should not be blank" do
    town = Town.new(name: " ")
    assert_not town.valid?
  end

  test "name should not be too short" do
    town = Town.new(name: "a")
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

  test "database enforces unique names" do
    now = Time.current
    attributes = { name: "DB unique town", created_at: now, updated_at: now }

    Town.insert_all!([ attributes ])

    assert_raises ActiveRecord::RecordNotUnique do
      Town.insert_all!([ attributes ])
    end
  end
end
