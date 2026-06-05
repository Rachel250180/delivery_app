class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_by(email: params[:session][:email].downcase)
    if user && user.authenticate(params[:session][:password])
      if user.activated?
        forwarding_url = session[:forwarding_url]
        reset_session
        params[:session][:remember_me] == "1" ? remember(user) : forget(user)
        log_in user
        redirect_to forwarding_url || user
      else
        message = "アカウントが承認されていません。"
        message += "メールから承認リンクをチェックしてください"
        flash[:warning] = message
        redirect_to root_url
      end
    else
      flash.now[:danger] = "メールアドレスまたはパスワードが違います"
      render "new", status: :unprocessable_entity
    end
  end

  def guest_login
    user = User.guest

    if user
      log_in user
      redirect_to user, notice: "ゲストユーザーでログインしました。"
    else
      redirect_to login_path, alert: "ゲストユーザーが存在しません"
    end
  end

  def destroy
    log_out if logged_in?
    redirect_to root_path, status: :see_other, notice: "ログアウトしました"
  end
end
