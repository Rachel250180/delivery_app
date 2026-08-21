require "test_helper"

class RoutePointsJsonParserTest < ActiveSupport::TestCase
  test "parses an array of route points" do
    points = [ { lat: 35.0, lng: 139.0, address: "東京都" } ]

    assert_equal JSON.parse(points.to_json),
                 RoutePointsJsonParser.parse(points.to_json)
  end

  test "returns nil when the value is blank" do
    assert_nil RoutePointsJsonParser.parse("")
  end

  test "rejects malformed json" do
    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse("{invalid")
    end
  end

  test "rejects json that is not an array" do
    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse({ lat: 35.0, lng: 139.0 }.to_json)
    end
  end

  test "rejects an array containing a non-object value" do
    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse([ "invalid" ].to_json)
    end
  end

  test "rejects non-numeric coordinates" do
    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse([ { lat: "35.0", lng: 139.0 } ].to_json)
    end
  end
end
