class Route < ApplicationRecord
    has_many :route_points, -> { order(:position) }, dependent: :destroy
    accepts_nested_attributes_for :route_points, reject_if: :all_blank
    # Google Maps の出発地点を除く、登録可能な経由地点数
    MAX_ROUTE_POINTS = 9

    belongs_to :town
    belongs_to :user

    validates :name,        length: { minimum: 3, maximum: 35 },
                            uniqueness: { scope: :town_id },
                            presence: true
    validates :description, length: { maximum: 255 }
    validate  :route_points_limit

  private

  # 採用しているAPIのGoogleマップの経由地点が、出発点含め10点までしか登録できないため
  def route_points_limit
    if route_points.size > MAX_ROUTE_POINTS
      errors.add(:route_points, "は#{MAX_ROUTE_POINTS}個までしか登録できません")
    end
  end
end
