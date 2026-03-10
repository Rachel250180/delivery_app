class CreateTowns < ActiveRecord::Migration[8.1]
  def change
    create_table :towns do |t|
      t.string :name

      t.timestamps
    end
  end
end
