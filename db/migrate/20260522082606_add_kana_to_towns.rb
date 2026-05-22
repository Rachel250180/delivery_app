class AddKanaToTowns < ActiveRecord::Migration[8.1]
  def change
    add_column :towns, :kana, :string
  end
end
