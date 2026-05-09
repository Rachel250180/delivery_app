class AddAddressToRoutePoints < ActiveRecord::Migration[8.1]
  def change
    add_column :route_points, :address, :string
  end
end
