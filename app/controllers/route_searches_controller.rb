class RouteSearchesController < ApplicationController
  def show
    @address = params[:address].to_s.strip
    return redirect_to_root("address_blank") if @address.blank?

    @town = Town.all.select { |town| @address.include?(town.name) }
                .max_by { |town| town.name.length }
    return redirect_to_root("town_not_found") unless @town

    @route = @town.routes.find_by(representative: true)
    redirect_to_root("representative_route_not_found") unless @route
  end

  private

  def redirect_to_root(message)
    redirect_to root_path, alert: t("flash.route_searches.#{message}")
  end
end
