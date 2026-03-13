class AddDescriptionToTowns < ActiveRecord::Migration[8.1]
  def change
    add_column :towns, :description, :text
  end
end
