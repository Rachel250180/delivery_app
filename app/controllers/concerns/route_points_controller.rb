class RoutePointsController < ApplicationController
  def create
    route = Route.find(params[:route_point][:route_id])

    last_position = route.route_points.build(route_point_params)

    @route_point = route.route_points.build(route_point_params)
    @route_point.position = last_position + 1

    if @route_point.save
      redirect_to route_path(route)
    else
      render :new
    end
  end

  private

  def route_point_params
    params.require(:route_point).permit(:latitude, :longitude, :route_id)
  end
end
