class CreateRoutePoints < ActiveRecord::Migration[8.1]
  def change
    create_table :route_points do |t|
      t.references :route, null: false, foreign_key: true
      t.float :latitude
      t.float :longitude
      t.integer :position

      t.timestamps
    end
  end
end
