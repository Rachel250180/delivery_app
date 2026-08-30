require "test_helper"

class RoutesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @town = towns(:one)
    @route = routes(:one)
    @user = users(:michael)
  end

  test "should get show" do
    get town_route_url(@town, @route)
    assert_response :success
    assert_select "#route-data[data-map-mode='show']"
    assert_select "script[data-google-maps-script]", count: 1
    assert_select "script[data-google-maps-script][src*='callback=googleMapsApiReady']",
                  count: 1
    assert_select "script[data-sortable-script]", count: 0
  end

  test "should get new" do
    log_in_as(@user)
    get new_town_route_url(@town)
    assert_response :success
    assert_select "#route-data[data-map-mode='new']"
    assert_select "script[data-google-maps-script]", count: 1
    assert_select "script[data-google-maps-script][src*='callback=googleMapsApiReady']",
                  count: 1
    assert_sortable_script_has_sri
  end

  test "should redirect new when not logged in" do
    get new_town_route_url(@town)
    assert_redirected_to login_url
  end

  test "should get edit" do
    log_in_as(@user)
    get edit_town_route_url(@town, @route)
    assert_response :success
    assert_select "#route-data[data-map-mode='edit']"
    assert_select "script[data-google-maps-script]", count: 1
    assert_select "script[data-google-maps-script][src*='callback=googleMapsApiReady']",
                  count: 1
    assert_sortable_script_has_sri
    assert_select "[data-turbo-confirm*='このルートを削除']", count: 1
  end

  test "should redirect edit when not logged in" do
    get edit_town_route_url(@town, @route)
    assert_redirected_to login_url
  end

  test "should create route" do
    log_in_as(@user)
    assert_difference("Route.count", 1) do
      post town_routes_url(@town), params: {
                                route: { name: "新しいルート",
                                         description: "説明" },
                                points_json: [ {
                                  lat: 35.0,
                                  lng: 139.0,
                                  address: "東京都"
                                } ].to_json }
    end

    assert_redirected_to town_route_url(@town, Route.last)
  end

  test "should redirect create when not logged in" do
    post town_routes_url(@town), params: {
                                route: { name: "新しいルート",
                                         description: "説明" } }
    assert_redirected_to login_url
  end

  test "should update route" do
    log_in_as(@user)
    patch town_route_url(@town, @route), params: {
      route: { name: "更新ルート" }
    }

    assert_redirected_to town_route_url(@town, @route)
  end

  test "should redirect update when not logged in" do
    patch town_route_url(@town, @route), params: {
                                         route: { name: "更新ルート" } }
    assert_redirected_to login_url
  end

  test "should destroy route" do
    log_in_as(@user)
    assert_difference("Route.count", -1) do
      delete town_route_path(@town, @route)
    end

    assert_redirected_to town_routes_url(@town)
  end

  test "should redirect destroy when not logged in" do
    delete town_route_path(@town, @route)
    assert_redirected_to login_url
  end

  test "data-points safely embeds addresses on new edit and show" do
    log_in_as(@route.user)
    addresses = [
      "O'Brien",
      '<script>alert("XSS")</script>',
      '<img src=x onerror="alert(\'XSS\')">'
    ]
    points = addresses.each_with_index.map do |address, index|
      { lat: 35.0 + index, lng: 139.0 + index, address: address }
    end

    post town_routes_path(@town), params: {
      route: { name: "" },
      points_json: points.to_json
    }
    assert_response :unprocessable_entity
    assert_safe_data_points(addresses)

    @route.route_points.destroy_all
    points.each_with_index do |point, index|
      @route.route_points.create!(
        latitude: point[:lat], longitude: point[:lng],
        address: point[:address], position: index
      )
    end

    get edit_town_route_url(@town, @route)
    assert_response :success
    assert_safe_data_points(addresses)

    get town_route_url(@town, @route)
    assert_response :success
    assert_safe_data_points(addresses)
  end

  private

  def assert_safe_data_points(addresses)
    assert_select "#route-data[data-points]", count: 1 do |elements|
      points = JSON.parse(elements.first["data-points"])
      assert_equal addresses, points.map { |point| point["address"] }
    end
    assert_no_match %r{<script>alert\("XSS"\)</script>}, response.body
    assert_no_match %r{<img src=x onerror=}, response.body
  end

  def assert_sortable_script_has_sri
    assert_select "script[data-sortable-script]", count: 1 do |scripts|
      assert_equal "sha384-eeLEhtwdMwD3X9y+8P3Cn7Idl/M+w8H4uZqkgD/2eJVkWIN1yKzEj6XegJ9dL3q0",
                   scripts.first["integrity"]
      assert_equal "anonymous", scripts.first["crossorigin"]
    end
  end
end
