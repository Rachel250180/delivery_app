require "test_helper"

class TownTest < ActiveSupport::TestCase

  test "name should not be blank" do
    town = Town.new(name: "")
    assert_not town.save
  end
end
