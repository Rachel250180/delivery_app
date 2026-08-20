class ApplicationController < ActionController::Base
  include SessionsHelper

  private

    def logged_in_user
      unless logged_in?
        flash[:danger] = t("flash.authentication.login_required")
        redirect_to login_url, status: :see_other
      end
    end
end
