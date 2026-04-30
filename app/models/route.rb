class Route < ApplicationRecord
    has_many :route_points, -> { order(:position) }, dependent: :destroy
    accepts_nested_attributes_for :route_points, reject_if: :all_blank
    belongs_to :town
    belongs_to :user
    validates :name, presence: true, length: { minimum: 3, maximum: 20 }, uniqueness: { scope: :town_id }

    validates :description, length: { maximum: 255 }
    validate :route_points_limit

  private

  def route_points_limit
    if route_points.size > 10
      errors.add(:route_points, "は10個までしか登録できません")
    end
  end
end
