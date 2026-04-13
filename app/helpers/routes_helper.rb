module RoutesHelper
  def google_maps_link(points)
    url = google_maps_url(points)
    return unless url

    link_to "Googleマップでルートを見る", url, target: "_blank"
  end

  def google_maps_url(points)
    return nil if points.empty?

    origin = "#{points.first.latitude},#{points.first.longitude}"
    destination = "#{points.last.latitude},#{points.last.longitude}"

    waypoints = points[1...-1]
      .map { |p| "#{p.latitude},#{p.longitude}" }
      .join("|")

    url = "https://www.google.com/maps/dir/?api=1"
    url += "&origin=#{origin}"
    url += "&destination=#{destination}"
    url += "&waypoints=#{waypoints}" if waypoints.present?
    url += "&travelmode=driving"

    url
  end
end
