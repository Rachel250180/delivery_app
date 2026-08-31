require "test_helper"

class RouteSearchesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @town = Town.create!(name: "由良町")
    @route = Route.create!(
      name: "テストルート",
      town: @town,
      user: users(:michael),
      representative: true,
      route_points_attributes: [
        { latitude: 36.0, longitude: 139.0, address: "地点A", position: 0 },
        { latitude: 36.1, longitude: 139.1, address: "地点B", position: 1 }
      ]
    )
  end

  test "finds a town contained in an address and shows its representative route" do
    get_with_successful_geocoding(address: "由良町1423")

    assert_response :success
    assert_select "dd", text: "由良町1423"
    assert_select "dd", text: @town.name
    assert_select "dd", text: @route.name
    assert_select "dd", text: "36.2912"
    assert_select "dd", text: "139.3754"
  end

  test "matches when a street number follows the town name" do
    get_with_successful_geocoding(address: "群馬県由良町1423番地")

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

  test "replaces only the final route point without changing the database" do
    original_points = @route.route_points.map(&:attributes)

    get_with_successful_geocoding(address: "由良町1423")

    points = response_route_points
    assert_equal(
      { "lat" => 36.0, "lng" => 139.0, "address" => "地点A" },
      points.first
    )
    assert_equal(
      { "lat" => 36.2912, "lng" => 139.3754, "address" => "由良町1423" },
      points.last
    )
    assert_equal original_points, @route.reload.route_points.map(&:attributes)
  end

  test "redirects with an error when the representative route has no points" do
    @route.route_points.delete_all

    assert_not_called(AddressGeocoder, :call) do
      get route_search_path, params: { address: "由良町1423" }
    end

    assert_redirected_to root_path
    assert_equal I18n.t("flash.route_searches.route_points_not_found"), flash[:alert]
  end

  test "uses the searched address as the only destination when the route has one point" do
    @route.route_points.where(position: 1).delete_all

    get_with_successful_geocoding(address: "由良町1423")

    assert_equal(
      [ { "lat" => 36.2912, "lng" => 139.3754, "address" => "由良町1423" } ],
      response_route_points
    )
    assert_equal "地点A", @route.reload.route_points.first.address
  end

  test "safely embeds special characters in the searched address" do
    address = %q(由良町"><script>alert('XSS')</script>)

    get_with_successful_geocoding(address: address)

    assert_equal address, response_route_points.last["address"]
    assert_no_match %r{<script>alert\('XSS'\)</script>}, response.body
  end

  test "redirects with an error when address is blank" do
    get route_search_path, params: { address: " " }

    assert_redirected_to root_path
    assert_equal I18n.t("flash.route_searches.address_blank"), flash[:alert]
  end

  test "a regular user can search" do
    log_in_as(users(:archer))

    get_with_successful_geocoding(address: "由良町1423")

    assert_response :success
    assert_select "dd", text: @route.name
  end

  test "a logged-out user can search" do
    get_with_successful_geocoding(address: "由良町1423")

    assert_response :success
    assert_select "dd", text: @route.name
  end

  test "redirects with an error when geocoding returns zero results" do
    result = AddressGeocoder::Result.new(status: :zero_results)

    AddressGeocoder.stub(:call, result) do
      get route_search_path, params: { address: "由良町1423" }
    end

    assert_redirected_to root_path
    assert_equal I18n.t("flash.route_searches.geocoding_zero_results"), flash[:alert]
  end

  test "redirects with an error when the geocoding API fails" do
    result = AddressGeocoder::Result.new(status: :api_error)

    AddressGeocoder.stub(:call, result) do
      get route_search_path, params: { address: "由良町1423" }
    end

    assert_redirected_to root_path
    assert_equal I18n.t("flash.route_searches.geocoding_api_error"), flash[:alert]
  end

  test "redirects with a warning for a rooftop partial match" do
    assert_inaccurate_geocoding(location_type: "ROOFTOP", partial_match: true)
  end

  test "redirects with a warning for a range interpolated result" do
    assert_inaccurate_geocoding(location_type: "RANGE_INTERPOLATED")
  end

  test "redirects with a warning for a geometric center result" do
    assert_inaccurate_geocoding(location_type: "GEOMETRIC_CENTER")
  end

  test "redirects with a warning for an approximate result" do
    assert_inaccurate_geocoding(location_type: "APPROXIMATE")
  end

  private

  def get_with_successful_geocoding(address:)
    result = AddressGeocoder::Result.new(
      status: :success,
      latitude: 36.2912,
      longitude: 139.3754,
      location_type: "ROOFTOP",
      partial_match: false
    )

    AddressGeocoder.stub(:call, result) do
      get route_search_path, params: { address: address }
    end
  end

  def response_route_points
    element = css_select("#route-data[data-points]").first
    JSON.parse(element["data-points"])
  end

  def assert_inaccurate_geocoding(location_type:, partial_match: false)
    original_points = @route.route_points.map(&:attributes)
    result = AddressGeocoder::Result.new(
      status: :success,
      latitude: 36.2912,
      longitude: 139.3754,
      location_type: location_type,
      partial_match: partial_match
    )

    AddressGeocoder.stub(:call, result) do
      get route_search_path, params: { address: "由良町1423" }
    end

    assert_redirected_to root_path
    assert_equal I18n.t("flash.route_searches.geocoding_inaccurate"), flash[:alert]
    assert_select "#route-data", count: 0
    assert_equal original_points, @route.reload.route_points.map(&:attributes)
  end
end
