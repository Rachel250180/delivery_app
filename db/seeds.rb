# メインのサンプルユーザーを1人作成する
User.find_or_create_by!(email: "example@railstutorial.org") do |user|
  user.name = "Example User"
  user.password = "password"
  user.password_confirmation = "password"
  user.admin = true
  user.activated = true
  user.activated_at = Time.zone.now
end

# ゲストユーザー
User.find_or_create_by!(email: "guest@example.com") do |user|
  user.name = "ゲストユーザー"
  user.password = "password"
  user.password_confirmation = "password"
  user.admin = false
  user.activated = true
  user.activated_at = Time.zone.now
end