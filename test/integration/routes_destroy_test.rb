# test/integration/routes_destroy_test.rb

require "test_helper"

class RoutesDestroyTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:michael)
    @town = towns(:one)
    @route = routes(:one)

    log_in_as(@user)
  end

  test "destroy route" do
    assert_difference("Route.count", -1) do
      delete town_route_path(@town, @route)
    end

    assert_redirected_to(
      town_routes_path(@town)
    )
  end
end
