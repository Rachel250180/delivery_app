class AddEstimatedDurationToRoutes < ActiveRecord::Migration[8.1]
  def change
    add_column :routes, :estimated_duration, :integer
  end
end
