module SessionsHelper
  def log_in(user)
    sesson[:user_id] = user.id
  end
end