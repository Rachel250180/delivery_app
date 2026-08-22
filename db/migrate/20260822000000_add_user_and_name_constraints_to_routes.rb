class AddUserAndNameConstraintsToRoutes < ActiveRecord::Migration[8.1]
  def up
    if select_value("SELECT 1 FROM routes WHERE user_id IS NULL LIMIT 1")
      raise ActiveRecord::MigrationError,
            "routes.user_id contains NULL values; assign an owner before migrating"
    end

    duplicate = select_one(<<~SQL.squish)
      SELECT town_id, name
      FROM routes
      GROUP BY town_id, name
      HAVING COUNT(*) > 1
      LIMIT 1
    SQL
    if duplicate
      raise ActiveRecord::MigrationError,
            "routes contains duplicate town_id/name pairs; resolve them before migrating"
    end

    change_column_null :routes, :user_id, false
    add_foreign_key :routes, :users
    add_index :routes, %i[town_id name], unique: true
  end

  def down
    remove_index :routes, column: %i[town_id name]
    remove_foreign_key :routes, :users
    change_column_null :routes, :user_id, true
  end
end
