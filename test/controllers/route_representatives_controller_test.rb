require "test_helper"

class RouteRepresentativesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = users(:michael)
    @user = users(:archer)
    @town = towns(:one)
    @route = routes(:one)
  end

  test "admin can set a representative route" do
    log_in_as(@admin)

    post town_route_representative_path(@town, @route)

    assert_redirected_to town_route_path(@town, @route)
    assert @route.reload.representative?
  end

  test "admin can unset a representative route" do
    @route.update!(representative: true)
    log_in_as(@admin)

    delete town_route_representative_path(@town, @route)

    assert_redirected_to town_route_path(@town, @route)
    assert_not @route.reload.representative?
  end

  test "setting another route replaces the representative in the same town" do
    @route.update!(representative: true)
    new_representative = create_route(name: "New Representative")
    log_in_as(@admin)

    post town_route_representative_path(@town, new_representative)

    assert_not @route.reload.representative?
    assert new_representative.reload.representative?
  end

  test "setting a route does not affect another town representative" do
    other_town_route = routes(:two)
    other_town_route.update!(representative: true)
    log_in_as(@admin)

    post town_route_representative_path(@town, @route)

    assert @route.reload.representative?
    assert other_town_route.reload.representative?
  end

  test "non-admin cannot change a representative route" do
    log_in_as(@user)

    post town_route_representative_path(@town, @route)

    assert_redirected_to root_path
    assert_not @route.reload.representative?
  end

  test "logged-out user cannot change a representative route" do
    post town_route_representative_path(@town, @route)

    assert_redirected_to login_url
    assert_not @route.reload.representative?
  end

  private

  def create_route(name:)
    route = Route.new(name: name, town: @town, user: @admin)
    route.route_points.build(
      latitude: 35.0,
      longitude: 139.0,
      position: 0
    )
    route.tap(&:save!)
  end
end
