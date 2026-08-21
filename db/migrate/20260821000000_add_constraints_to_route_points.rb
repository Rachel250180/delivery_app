class AddConstraintsToRoutePoints < ActiveRecord::Migration[8.1]
  def change
    change_column_null :route_points, :latitude, false
    change_column_null :route_points, :longitude, false
    change_column_null :route_points, :position, false

    add_index :route_points, [ :route_id, :position ], unique: true
    add_check_constraint :route_points,
                         "latitude BETWEEN -90 AND 90",
                         name: "route_points_latitude_range"
    add_check_constraint :route_points,
                         "longitude BETWEEN -180 AND 180",
                         name: "route_points_longitude_range"
    add_check_constraint :route_points,
                         "position >= 0",
                         name: "route_points_position_non_negative"
  end
end
