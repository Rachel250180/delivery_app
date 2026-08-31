require "test_helper"

class AddressGeocoderTest < ActiveSupport::TestCase
  test "treats a rooftop result without a partial match as accurate" do
    response = geocoding_response(location_type: "ROOFTOP", partial_match: false)

    Net::HTTP.stub(:get_response, response) do
      result = AddressGeocoder.call("由良町1423", api_key: "test-key")

      assert result.success?
      assert result.accurate?
      assert_equal 36.2912, result.latitude
      assert_equal 139.3754, result.longitude
      assert_equal "ROOFTOP", result.location_type
      assert_equal false, result.partial_match
    end
  end

  test "treats a rooftop partial match as inaccurate" do
    result = geocode(location_type: "ROOFTOP", partial_match: true)

    assert result.success?
    assert_not result.accurate?
    assert result.partial_match
  end

  test "treats a range interpolated result as inaccurate" do
    result = geocode(location_type: "RANGE_INTERPOLATED")

    assert result.success?
    assert_not result.accurate?
  end

  test "treats a geometric center result as inaccurate" do
    result = geocode(location_type: "GEOMETRIC_CENTER")

    assert result.success?
    assert_not result.accurate?
  end

  test "treats an approximate result as inaccurate" do
    result = geocode(location_type: "APPROXIMATE")

    assert result.success?
    assert_not result.accurate?
  end

  test "treats a missing partial match as false" do
    result = geocode(location_type: "ROOFTOP", include_partial_match: false)

    assert_equal false, result.partial_match
    assert result.accurate?
  end

  test "returns an API error when coordinates are missing" do
    response = successful_response(
      status: "OK",
      results: [ { geometry: { location_type: "ROOFTOP" } } ]
    )

    Net::HTTP.stub(:get_response, response) do
      result = AddressGeocoder.call("由良町1423", api_key: "test-key")

      assert_equal :api_error, result.status
      assert_not result.accurate?
    end
  end

  test "distinguishes zero results" do
    response = successful_response(status: "ZERO_RESULTS", results: [])

    Net::HTTP.stub(:get_response, response) do
      result = AddressGeocoder.call("由良町1423", api_key: "test-key")

      assert_equal :zero_results, result.status
    end
  end

  test "returns an API error when communication fails" do
    Net::HTTP.stub(:get_response, ->(*) { raise SocketError }) do
      result = AddressGeocoder.call("由良町1423", api_key: "test-key")

      assert_equal :api_error, result.status
    end
  end

  test "returns an API error for an API error status" do
    response = successful_response(status: "REQUEST_DENIED", results: [])

    Net::HTTP.stub(:get_response, response) do
      result = AddressGeocoder.call("由良町1423", api_key: "test-key")

      assert_equal :api_error, result.status
    end
  end

  private

  def successful_response(body)
    Net::HTTPSuccess.new("1.1", "200", "OK").tap do |response|
      response.instance_variable_set(:@read, true)
      response.body = body.to_json
    end
  end

  def geocode(location_type:, partial_match: false, include_partial_match: true)
    response = geocoding_response(
      location_type: location_type,
      partial_match: partial_match,
      include_partial_match: include_partial_match
    )

    Net::HTTP.stub(:get_response, response) do
      return AddressGeocoder.call("由良町1423", api_key: "test-key")
    end
  end

  def geocoding_response(location_type:, partial_match: false, include_partial_match: true)
    result = {
      geometry: {
        location: { lat: 36.2912, lng: 139.3754 },
        location_type: location_type
      }
    }
    result[:partial_match] = partial_match if include_partial_match

    successful_response(status: "OK", results: [ result ])
  end
end
