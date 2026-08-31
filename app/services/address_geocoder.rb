require "net/http"
require "json"
require "timeout"
require "openssl"

class AddressGeocoder
  ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json"
  Result = Struct.new(:status, :latitude, :longitude, keyword_init: true) do
    def success?
      status == :success
    end
  end

  def self.call(address, api_key: Rails.application.credentials.google_maps_server_api_key)
    new(address, api_key).call
  end

  def initialize(address, api_key)
    @address = address
    @api_key = api_key
  end

  def call
    response = Net::HTTP.get_response(request_uri)
    return Result.new(status: :api_error) unless response.is_a?(Net::HTTPSuccess)

    parse_response(response.body)
  rescue JSON::ParserError, SocketError, SystemCallError, Timeout::Error,
         OpenSSL::SSL::SSLError, IOError, EOFError, URI::InvalidURIError
    Result.new(status: :api_error)
  end

  private

  def request_uri
    URI(ENDPOINT).tap do |uri|
      uri.query = URI.encode_www_form(address: @address, key: @api_key)
    end
  end

  def parse_response(body)
    data = JSON.parse(body)
    return Result.new(status: :zero_results) if data["status"] == "ZERO_RESULTS"
    return Result.new(status: :api_error) unless data["status"] == "OK"

    location = data.dig("results", 0, "geometry", "location")
    return Result.new(status: :api_error) unless location&.key?("lat") && location&.key?("lng")

    Result.new(
      status: :success,
      latitude: location["lat"],
      longitude: location["lng"]
    )
  end
end
