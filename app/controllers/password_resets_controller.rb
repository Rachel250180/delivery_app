class PasswordResetsController < ApplicationController
  before_action :get_user, :valid_user, :check_expiration, only: %i[edit update]
  def new
  end

  def create
    @user = User.find_by(email: params[:password_reset][:email].downcase)
    if @user
      @user.create_reset_digest
      @user.send_password_reset_email
      flash[:info] = "パスワードリセット手順を記載したメールが送信されました。"
      redirect_to root_url
    else
      flash.now[:danger] = "メールアドレスが見つかりません。"
      render "new", status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    return render_empty_password if params[:user][:password].blank?

    if @user.update(user_params)
      @user.forget
      reset_session
      log_in @user
      @user.update_attribute(:reset_digest, nil)
      flash[:success] = "パスワードがリセットされました。"
      redirect_to @user
    else
      render "edit", status: :unprocessable_entity
    end
  end

  private

    def user_params
      params.require(:user).permit(:password, :password_confirmation)
    end

    def get_user
      @user = User.find_by(email: params[:email])
    end

    def valid_user
      return if @user&.activated? &&
                @user.authenticated?(:reset, params[:id])

      redirect_to root_url
    end

    def check_expiration
      if @user.password_reset_expired?
        flash[:danger] = "パスワードリセットの期限が切れています。"
        redirect_to new_password_reset_url
      end
    end

    def render_empty_password
      @user.errors.add(:password, "can't be empty")
      render :edit, status: :unprocessable_entity
    end
end
