class RouteSearchesController < ApplicationController
  rate_limit to: 20, within: 1.minute,
             by: -> { request.remote_ip },
             with: :render_rate_limited,
             only: :show,
             name: "route-search-ip"

  def show
    @address = params[:address].to_s.strip
    return redirect_to_root("address_blank") if @address.blank?

    @town = Town.all.select { |town| @address.include?(town.name) }
                .max_by { |town| town.name.length }
    return redirect_to_root("town_not_found") unless @town

    @route = @town.routes.find_by(representative: true)
    return redirect_to_root("representative_route_not_found") unless @route
    return redirect_to_root("route_points_not_found") if @route.route_points.empty?

    geocoding = AddressGeocoder.call(@address)
    return redirect_to_root("geocoding_zero_results") if geocoding.status == :zero_results
    return redirect_to_root("geocoding_api_error") unless geocoding.success?
    return redirect_to_root("geocoding_inaccurate") unless geocoding.accurate?

    @latitude = geocoding.latitude
    @longitude = geocoding.longitude
    @search_route_points = @route.route_points.map do |point|
      { lat: point.latitude, lng: point.longitude, address: point.address }
    end
    @search_route_points[-1] = {
      lat: @latitude,
      lng: @longitude,
      address: @address
    }
    @route_points = @search_route_points.map.with_index do |point, index|
      RoutePoint.new(
        latitude: point[:lat],
        longitude: point[:lng],
        address: point[:address],
        position: index
      )
    end
  end

  private

  def redirect_to_root(message)
    redirect_to root_path, alert: t("flash.route_searches.#{message}")
  end
end
