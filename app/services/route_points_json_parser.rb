class RoutePointsJsonParser
  class InvalidFormat < StandardError; end

  def self.parse(value)
    return if value.blank?

    points = JSON.parse(value)
    raise InvalidFormat unless valid_points?(points)

    points
  rescue JSON::ParserError
    raise InvalidFormat
  end

  def self.valid_points?(points)
    points.is_a?(Array) && points.all? do |point|
      point.is_a?(Hash) &&
        point["lat"].is_a?(Numeric) &&
        point["lng"].is_a?(Numeric)
    end
  end

  private_class_method :valid_points?
end
