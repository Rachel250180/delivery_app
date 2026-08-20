class AccountActivationResendsController < ApplicationController
  def show
    @email = session[:activation_email]

    unless @email
      redirect_to signup_path, alert: t("flash.account_activations.restart")
    end
  end

  def create
    user = User.find_by(email: session[:activation_email])

    if user && !user.activated?
      user.resend_activation_email

      flash[:success] = t("flash.account_activations.resend")
    end

    redirect_to account_activation_resend_path
  end
end
