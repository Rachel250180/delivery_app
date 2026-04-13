class RoutesController < ApplicationController
  before_action :logged_in_user, only: [ :new, :create, :edit, :update, :destroy ]
  before_action :set_town
  before_action :set_route, only: [ :show, :edit, :update, :destroy ]

  def show
    @route = @town.routes.find(params[:id])
    @points = @route.route_points.order(:position)
  end

  def new
    @route = @town.routes.new
  end

  def create
    @route = @town.routes.new(route_params)
    @route.user = current_user

    if params[:points_json].present?
      points = JSON.parse(params[:points_json])

      points.each_with_index do |p, i|
        @route.route_points.new(
          latitude: p["lat"],
          longitude: p["lng"],
          position: i)
      end
    end

    if @route.save
      redirect_to town_route_path(@town, @route), notice: "ルートを作成しました！"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    @route = @town.routes.find(params[:id])

    if @route.update(route_params)
      redirect_to town_route_path(@town, @route)
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @route.destroy
    redirect_to town_routes_path(@town), notice: "削除しました"
  end

  private

  def route_params
    params.require(:route).permit(:name,
                                  :description,)
  end

  def set_town
    @town = Town.find(params[:town_id])
  end

  def set_route
    @route = @town.routes.find(params[:id])
  end
end
