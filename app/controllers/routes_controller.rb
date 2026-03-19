class RoutesController < ApplicationController
  before_action :set_town
  before_action :set_route, only: [ :show, :edit, :update, :destroy ]

  def show
  end

  def new
    @route = @town.routes.new
  end

  def create
    @route = @town.routes.new(route_params)
    @route.user = current_user

    if @route.save
      redirect_to town_route_path(@town, @route), notice: "ルートを作成しました！"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
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
    params.require(:route).permit(:name, :description)
  end

  def set_town
    @town = Town.find(params[:town_id])
  end

  def set_route
    @route = @town.routes.find(params[:id])
  end
end
