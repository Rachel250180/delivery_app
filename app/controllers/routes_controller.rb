class RoutesController < ApplicationController
  before_action :logged_in_user, only: [ :new, :create, :edit, :update, :destroy ]
  before_action :set_town
  before_action :set_route, only: [ :show, :edit, :update, :destroy ]
  before_action :correct_user, only: [ :edit, :update, :destroy ]
  def index
    redirect_to town_path(@town)
  end

  def show
    @route_points = @route.route_points.order(:position)
  end

  def new
    @route = @town.routes.new
    @route_points = []
  end

  def create
    @route = @town.routes.new(route_params)
    @route.user = current_user

    build_route_points(@route)

    if over_route_points_limit?
      @route.errors.add(:route_points, "は9個までしか登録できません")
      @route_points = @route.route_points
      render :new, status: :unprocessable_entity
      return
    end

    if @route.save
      redirect_to town_route_path(@town, @route), notice: "ルートを作成しました！"
    else
      @route_points = []
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @route_points = @route.route_points.order(:position)
  end

  def update
    if @route.update(route_params)
      @route.route_points.destroy_all
      build_route_points(@route)

      if over_route_points_limit?
        @route.errors.add(:route_points, "は9個までしか登録できません")
        @route_points = @route.route_points
        render :edit, status: :unprocessable_entity
        return
      end

      @route.save!
      redirect_to town_route_path(@town, @route)
    else
      @route_points = @route.route_points.order(:position)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @route.destroy
    redirect_to town_routes_path(@town), notice: "削除しました"
  end

  private

  def route_params
    params.require(:route).permit(
      :name,
      :description,
      :estimated_duration
    )
  end


  def set_town
    @town = Town.find(params[:town_id])
  end


  def set_route
    @route = @town.routes.find(params[:id])
  end


  def correct_user
    return if @route.user_id == current_user.id
    redirect_to root_path, alert: "権限がありません"
  end


  def build_route_points(route)
    return unless params[:points_json].present?

    points = JSON.parse(params[:points_json])

    points.each_with_index do |point, index|
      route.route_points.build(
        latitude:  point["lat"],
        longitude: point["lng"],
        address:   point["address"],
        position:  index
      )
    end
  end

  def over_route_points_limit?
    @route.route_points.size > Route::MAX_ROUTE_POINTS
  end
end
