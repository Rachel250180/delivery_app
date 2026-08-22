class AddUniqueIndexToTownsName < ActiveRecord::Migration[8.1]
  def change
    add_index :towns, :name, unique: true
  end
end
