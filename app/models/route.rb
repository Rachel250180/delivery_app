class Route < ApplicationRecord
    has_many :route_points, -> { order(:position) }, dependent: :destroy
    accepts_nested_attributes_for :route_points, reject_if: :all_blank
    belongs_to :town
    belongs_to :user
    validates :name, presence: true, length: { minimum: 3, maximum: 20 }
    validates :description, length: { maximum: 255 }
end
