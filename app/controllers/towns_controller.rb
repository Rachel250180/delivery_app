class TownsController < ApplicationController
  def index
    if params[:name].present?
      @towns =Town.where("name LIKE ?", "%#{params[:name]}%")
    else
      @towns = Town.all
    end
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
      redirect_to @town, notice: "町名を追加しました！"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    @town = Town.find(params[:id])

    if @town.update(town_params)
      redirect_to @town
    else
      render :edit, , status: :unprocessable_entity
    end
  end

  def destroy
    @town = Town.find(params[:id])
    @town.destroy
    redirect_to towns_path
  end









  private

  def town_params
    params.require(:town).permit(:name)
  end



end
