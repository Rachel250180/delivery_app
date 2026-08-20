class AccountActivationsController < ApplicationController
  def edit
    user = User.find_by(email: params[:email])
    if user && !user.activated? && user.authenticated?(:activation, params[:id])
      user.activate
      log_in user
      flash[:success] = t("flash.account_activations.activated")
      redirect_to user
      session.delete(:activation_email)
    else
      flash[:danger] = t("flash.account_activations.invalid_link")
      redirect_to root_url
    end
  end
end
