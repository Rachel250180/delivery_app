class RoutesController < ApplicationController
  before_action :logged_in_user, only: [ :new, :create, :edit, :update, :destroy ]
  before_action :set_town
  before_action :set_route, only: [ :show, :edit, :update, :destroy ]

  def show
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
    @points = @route.route_points.order(:position)
  end

  def update
    if @route.update(route_params)

      if params[:points_json].present?
        points = JSON.parse(params[:points_json])

        @route.route_points.destroy_all

        points.each_with_index do |p, i|
          @route.route_points.create!(
            latitude: p["lat"],
            longitude: p["lng"],
            position: i
          )
        end
      end

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
