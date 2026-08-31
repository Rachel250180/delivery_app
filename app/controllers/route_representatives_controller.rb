class RouteRepresentativesController < ApplicationController
  before_action :logged_in_user
  before_action :admin_user
  before_action :set_town_and_route

  def create
    Route.transaction do
      @town.lock!
      current_representative = @town.routes.find_by(representative: true)
      if current_representative && current_representative != @route
        current_representative.update!(representative: false)
      end
      @route.update!(representative: true)
    end

    redirect_to town_route_path(@town, @route),
                notice: t("flash.route_representatives.created")
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
    redirect_to town_route_path(@town, @route),
                alert: t("flash.route_representatives.update_failed")
  end

  def destroy
    Route.transaction do
      @town.lock!
      @route.update!(representative: false)
    end

    redirect_to town_route_path(@town, @route),
                notice: t("flash.route_representatives.destroyed")
  rescue ActiveRecord::RecordInvalid
    redirect_to town_route_path(@town, @route),
                alert: t("flash.route_representatives.update_failed")
  end

  private

  def set_town_and_route
    @town = Town.find(params[:town_id])
    @route = @town.routes.find(params[:route_id])
  end
end
