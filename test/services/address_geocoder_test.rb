require "test_helper"

class AddressGeocoderTest < ActiveSupport::TestCase
  test "returns coordinates for a successful response" do
    response = successful_response(
      status: "OK",
      results: [ { geometry: { location: { lat: 36.2912, lng: 139.3754 } } } ]
    )

    Net::HTTP.stub(:get_response, response) do
      result = AddressGeocoder.call("由良町1423", api_key: "test-key")

      assert result.success?
      assert_equal 36.2912, result.latitude
      assert_equal 139.3754, result.longitude
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

  private

  def successful_response(body)
    Net::HTTPSuccess.new("1.1", "200", "OK").tap do |response|
      response.instance_variable_set(:@read, true)
      response.body = body.to_json
    end
  end
end
