class RoutePointsJsonParser
  class InvalidFormat < StandardError; end

  def self.parse(value)
    return if value.blank?
    raise InvalidFormat unless value.is_a?(String)

    points = JSON.parse(value)
    raise InvalidFormat unless points.is_a?(Array)
    raise InvalidFormat if points.size > Route::MAX_ROUTE_POINTS
    raise InvalidFormat unless valid_points?(points)

    points
  rescue JSON::ParserError
    raise InvalidFormat
  end

  def self.valid_points?(points)
    points.all? do |point|
      point.is_a?(Hash) &&
        valid_coordinate?(point["lat"], -90..90) &&
        valid_coordinate?(point["lng"], -180..180) &&
        valid_address?(point["address"])
    end
  end

  def self.valid_coordinate?(coordinate, range)
    coordinate.is_a?(Numeric) &&
      coordinate.finite? &&
      range.cover?(coordinate)
  end

  def self.valid_address?(address)
    address.nil? ||
      (address.is_a?(String) && address.length <= RoutePoint::MAX_ADDRESS_LENGTH)
  end

  private_class_method :valid_points?, :valid_coordinate?, :valid_address?
end
