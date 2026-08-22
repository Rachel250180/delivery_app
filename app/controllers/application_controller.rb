class ApplicationController < ActionController::Base
  include SessionsHelper

  private

    def logged_in_user
      unless logged_in?
        flash[:danger] = t("flash.authentication.login_required")
        redirect_to login_url, status: :see_other
      end
    end

    def rate_limit_key(email)
      normalized_email = email.to_s.strip.downcase
      Digest::SHA256.hexdigest(normalized_email)
    end

    def render_rate_limited
      render plain: t("flash.rate_limit.exceeded"), status: :too_many_requests
    end
end
