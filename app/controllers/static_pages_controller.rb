class StaticPagesController < ApplicationController
  before_action :require_login

  private_class_method

  def require_login
    unless logged_in?
      flash[:danger] = "ログインしてください"
      redirect_to login_path
    end
  end
end
