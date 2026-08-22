class PasswordResetsController < ApplicationController
  before_action :get_user, :valid_user, :check_expiration, only: %i[edit update]
  rate_limit to: 5, within: 15.minutes,
             by: -> { request.remote_ip },
             with: :render_rate_limited,
             only: :create,
             name: "password-reset-ip"
  rate_limit to: 3, within: 1.hour,
             by: -> { rate_limit_key(params.dig(:password_reset, :email)) },
             with: :render_rate_limited,
             only: :create,
             name: "password-reset-email"

  def new
    @password_reset = PasswordResetRequest.new
  end

  def create
    @password_reset = PasswordResetRequest.new(
      email: params.dig(:password_reset, :email)
    )
    return render(:new, status: :unprocessable_entity) unless @password_reset.valid?

    @user = User.find_by(email: @password_reset.normalized_email)
    if @user && !@user.password_reset_recently_sent?
      @user.create_reset_digest
      @user.send_password_reset_email
    end

    redirect_to root_url, notice: t("flash.password_resets.sent")
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
      flash[:success] = t("flash.password_resets.completed")
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
        flash[:danger] = t("flash.password_resets.expired")
        redirect_to new_password_reset_url
      end
    end

    def render_empty_password
      @user.errors.add(:password, :blank)
      render :edit, status: :unprocessable_entity
    end
end
