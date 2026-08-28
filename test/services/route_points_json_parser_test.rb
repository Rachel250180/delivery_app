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

  test "rejects an array passed directly" do
    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse([ { lat: 35.0, lng: 139.0 } ])
    end
  end

  test "rejects a hash passed directly" do
    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse({ lat: 35.0, lng: 139.0 })
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

  test "accepts exactly the maximum number of route points" do
    points = Array.new(Route::MAX_ROUTE_POINTS) do
      { lat: 35.0, lng: 139.0 }
    end

    assert_equal points.as_json,
                 RoutePointsJsonParser.parse(points.to_json)
  end

  test "rejects one more than the maximum number of route points" do
    points = Array.new(Route::MAX_ROUTE_POINTS + 1) do
      { lat: 35.0, lng: 139.0 }
    end

    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse(points.to_json)
    end
  end

  test "rejects far more than the maximum number of route points" do
    points = Array.new(Route::MAX_ROUTE_POINTS * 1_000) do
      { lat: 35.0, lng: 139.0 }
    end

    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse(points.to_json)
    end
  end

  test "accepts latitude boundary values" do
    points = [
      { lat: -90, lng: 139.0 },
      { lat: 90, lng: 139.0 }
    ]

    assert_equal points.as_json,
                 RoutePointsJsonParser.parse(points.to_json)
  end

  test "accepts longitude boundary values" do
    points = [
      { lat: 35.0, lng: -180 },
      { lat: 35.0, lng: 180 }
    ]

    assert_equal points.as_json,
                 RoutePointsJsonParser.parse(points.to_json)
  end

  test "rejects coordinates outside their valid ranges" do
    invalid_points = [
      { lat: -91, lng: 139.0 },
      { lat: 91, lng: 139.0 },
      { lat: 35.0, lng: -181 },
      { lat: 35.0, lng: 181 }
    ]

    invalid_points.each do |point|
      assert_raises RoutePointsJsonParser::InvalidFormat do
        RoutePointsJsonParser.parse([ point ].to_json)
      end
    end
  end

  test "rejects non-finite coordinate tokens" do
    [ "NaN", "Infinity", "-Infinity" ].each do |coordinate|
      assert_raises RoutePointsJsonParser::InvalidFormat do
        RoutePointsJsonParser.parse(%([{"lat":#{coordinate},"lng":139.0}]))
      end
    end
  end

  test "accepts an omitted or nil address" do
    points = [
      { lat: 35.0, lng: 139.0 },
      { lat: 35.0, lng: 139.0, address: nil }
    ]

    assert_equal points.as_json,
                 RoutePointsJsonParser.parse(points.to_json)
  end

  test "rejects an array address" do
    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse(
        [ { lat: 35.0, lng: 139.0, address: [ "東京都" ] } ].to_json
      )
    end
  end

  test "rejects a hash address" do
    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse(
        [ { lat: 35.0, lng: 139.0, address: { city: "東京都" } } ].to_json
      )
    end
  end

  test "accepts an address at the maximum length" do
    points = [ {
      lat: 35.0,
      lng: 139.0,
      address: "あ" * RoutePoint::MAX_ADDRESS_LENGTH
    } ]

    assert_equal points.as_json,
                 RoutePointsJsonParser.parse(points.to_json)
  end

  test "rejects an address longer than the maximum length" do
    points = [ {
      lat: 35.0,
      lng: 139.0,
      address: "あ" * (RoutePoint::MAX_ADDRESS_LENGTH + 1)
    } ]

    assert_raises RoutePointsJsonParser::InvalidFormat do
      RoutePointsJsonParser.parse(points.to_json)
    end
  end
end
