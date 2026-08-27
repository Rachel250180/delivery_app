class AccountActivationResendsController < ApplicationController
  rate_limit to: 5, within: 15.minutes,
             by: -> { request.remote_ip },
             with: :render_rate_limited,
             only: :create,
             name: "activation-resend-ip"
  rate_limit to: 3, within: 1.hour,
             by: -> { rate_limit_key(session[:activation_email]) },
             with: :render_rate_limited,
             only: :create,
             name: "activation-resend-email"

  def show
    @email = session[:activation_email]

    unless @email
      redirect_to signup_path, alert: t("flash.account_activations.restart")
    end
  end

  def create
    user = User.find_by(email: session[:activation_email])

    begin
      if user && !user.activated?
        if user.resend_activation_email
          flash[:success] = t("flash.account_activations.resend")
        else
          flash[:info] = t("flash.account_activations.wait")
        end
      end
    rescue *ApplicationMailer::DELIVERY_ERRORS => error
      Rails.logger.error(
        "Activation email redelivery failed for user_id=#{user.id}: " \
        "#{error.class}: #{error.message}"
      )
      flash[:alert] = t("flash.account_activations.delivery_failed")
    end

    redirect_to account_activation_resend_path
  end
end
