class AddRepresentativeToRoutes < ActiveRecord::Migration[8.1]
  def change
    add_column :routes, :representative, :boolean, default: false, null: false
    add_index :routes, :town_id,
              unique: true,
              where: "representative = true",
              name: "index_routes_on_town_id_where_representative"
  end
end
