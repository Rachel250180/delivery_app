require "test_helper"

class RouteSearchesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @town = Town.create!(name: "由良町")
    @route = Route.create!(
      name: "テストルート",
      town: @town,
      user: users(:michael),
      representative: true,
      route_points_attributes: [ { lat: 36.0, lng: 139.0, position: 0 } ]
    )
  end

  test "finds a town contained in an address and shows its representative route" do
    get route_search_path, params: { address: "由良町1423" }

    assert_response :success
    assert_select "dd", text: "由良町1423"
    assert_select "dd", text: @town.name
    assert_select "dd", text: @route.name
  end

  test "matches when a street number follows the town name" do
    get route_search_path, params: { address: "群馬県由良町1423番地" }

    assert_response :success
    assert_select "dd", text: @town.name
  end

  test "redirects with an error when no town matches" do
    get route_search_path, params: { address: "存在しない町123" }

    assert_redirected_to root_path
    assert_equal I18n.t("flash.route_searches.town_not_found"), flash[:alert]
  end

  test "redirects with an error when the town has no representative route" do
    @route.update!(representative: false)

    get route_search_path, params: { address: "由良町1423" }

    assert_redirected_to root_path
    assert_equal I18n.t("flash.route_searches.representative_route_not_found"), flash[:alert]
  end

  test "redirects with an error when address is blank" do
    get route_search_path, params: { address: " " }

    assert_redirected_to root_path
    assert_equal I18n.t("flash.route_searches.address_blank"), flash[:alert]
  end

  test "a regular user can search" do
    log_in_as(users(:archer))

    get route_search_path, params: { address: "由良町1423" }

    assert_response :success
    assert_select "dd", text: @route.name
  end

  test "a logged-out user can search" do
    get route_search_path, params: { address: "由良町1423" }

    assert_response :success
    assert_select "dd", text: @route.name
  end
end
