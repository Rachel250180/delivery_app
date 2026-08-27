class AddModelConstraintsAndRouteUserIndex < ActiveRecord::Migration[8.1]
  def change
    change_column_null :routes, :name, false
    change_column_null :users, :name, false
    change_column_null :users, :email, false
    change_column_null :users, :password_digest, false
    change_column_null :users, :admin, false
    change_column_null :users, :activated, false
    change_column_null :towns, :name, false

    add_index :routes, :user_id, name: "index_routes_on_user_id"

    add_check_constraint :routes,
                         "estimated_duration >= 0",
                         name: "routes_estimated_duration_non_negative"
  end
end
