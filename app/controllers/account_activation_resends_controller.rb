class AccountActivationResendsController < ApplicationController
  def show
    @email = session[:activation_email]

    unless @email
      redirect_to signup_path, alert: "最初からやり直してください。"
    end
  end

  def create
    user = User.find_by(email: session[:activation_email])

    if user && !user.activated?
      user.resend_activation_email

      flash[:success] = "認証メールを再送しました。"
    end

    redirect_to account_activation_resend_path
  end
end
