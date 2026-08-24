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

    points = route_points_from_params
    build_route_points(@route, points)

    if @route.save
      redirect_to town_route_path(@town, @route), notice: t("flash.routes.created")
    else
      @route_points = @route.route_points
      render :new, status: :unprocessable_entity
    end
  rescue RoutePointsJsonParser::InvalidFormat
    @route.errors.add(:route_points, t("flash.routes.invalid_points_json"))
    @route_points = @route.route_points
    render :new, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotUnique
    render_name_taken(:new)
  end

  def edit
    @route_points = @route.route_points.order(:position)
  end

  def update
    points = route_points_from_params

    Route.transaction do
      @route.assign_attributes(route_params)

      if points
        @route.route_points.destroy_all
        build_route_points(@route, points)
      end

      @route.save!
    end

    redirect_to town_route_path(@town, @route), notice: t("flash.routes.updated")
  rescue RoutePointsJsonParser::InvalidFormat
    @route.errors.add(:route_points, t("flash.routes.invalid_points_json"))
    @route_points = @route.route_points.order(:position)
    render :edit, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotUnique
    render_name_taken(:edit)
  rescue ActiveRecord::RecordInvalid
    @route_points = @route.route_points
    render :edit, status: :unprocessable_entity
  end

  def destroy
    @route.destroy
    redirect_to town_routes_path(@town), notice: t("flash.routes.deleted")
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
    redirect_to root_path, alert: t("flash.authorization.denied")
  end


  def build_route_points(route, points = route_points_from_params)
    return unless points

    points.each_with_index do |point, index|
      route.route_points.build(
        latitude:  point["lat"],
        longitude: point["lng"],
        address:   point["address"],
        position:  index
      )
    end
  end

  def route_points_from_params
    RoutePointsJsonParser.parse(params[:points_json])
  end

  def render_name_taken(template)
    @route.errors.add(:name, :taken)
    @route_points = @route.route_points
    render template, status: :unprocessable_entity
  end
end
