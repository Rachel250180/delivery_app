class UsersController < ApplicationController
  before_action :logged_in_user, only: [ :show, :edit, :update, :destroy ]
  before_action :correct_user,   only: [ :show, :edit, :update ]
  before_action :admin_user,     only: [ :destroy ]
  def new
    @user = User.new
  end

  def show
    @user = User.find(params[:id])
  end

  def create
    @user = User.new(user_params)
    if @user.save
      @user.send_activation_email
      session[:activation_email] = @user.email

      redirect_to account_activation_resend_path
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @user = User.find(params[:id])
  end

  def update
    if @user.email == "guest@example.com"
      redirect_to root_path,
                  alert: t("flash.authorization.guest_user_cannot_be_edited")
      return
    end

    @user = User.find(params[:id])
    if @user.update(user_params)
      flash[:success] = t("flash.users.updated")
      redirect_to @user
    else
      render "edit", status: :unprocessable_entity
    end
  end

  def destroy
    User.find(params[:id]).destroy
    flash[:success] = t("flash.users.deleted")
    redirect_to users_url, status: :see_other
  end

  private

    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end

    def logged_in_user
      unless logged_in?
        store_location
        flash[:danger] = t("flash.authentication.login_required")
        redirect_to login_url, status: :see_other
      end
    end

    def correct_user
      @user = User.find(params[:id])
      redirect_to(root_url, status: :see_other) unless current_user?(@user)
    end

    def admin_user
      redirect_to(root_url, status: :see_other, alert: t("flash.authorization.denied")) unless current_user.admin?
    end
end
