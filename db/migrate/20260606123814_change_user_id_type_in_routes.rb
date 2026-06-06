class ChangeUserIdTypeInRoutes < ActiveRecord::Migration[8.1]
  def change
    change_column :routes, :user_id, :bigint
  end
end
