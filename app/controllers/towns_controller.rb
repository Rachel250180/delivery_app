class TownsController < ApplicationController
  before_action :logged_in_user,
                only: [ :new, :create, :edit, :update, :destroy ]
  before_action :admin_user,
                only: [ :new, :create, :edit, :update, :destroy ]
  def index
    @towns = Town.all

    if params[:name].present?
      keyword = params[:name].to_s
      normalized = keyword.tr("ァ-ン", "ぁ-ん")

      @towns = @towns.where(
        "name LIKE :keyword OR kana LIKE :normalized",
        keyword: "%#{keyword}%",
        normalized: "%#{normalized}%"
      )
    end

    # ★ここで必ず五十音順固定
    @towns = @towns.order(:kana)

    @towns = @towns.page(params[:page]).per(20)
  end

  def show
    @town = Town.find(params[:id])
    @routes = @town.routes
  end

  def new
    @town = Town.new
  end

  def create
    @town = Town.new(town_params)

    if @town.save
      redirect_to new_town_route_path(@town), notice: "町名を追加しました！"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @town = Town.find(params[:id])
  end

  def update
    @town = Town.find(params[:id])

    if @town.update(town_params)
      redirect_to @town
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @town = Town.find(params[:id])
    @town.destroy
    redirect_to towns_path
  end




  private

  def town_params
    params.require(:town).permit(:name, :kana, :description)
  end

  def admin_user
    redirect_to(root_path, status: :see_other, alert: "権限がありません") unless current_user.admin?
  end
end
