class Route < ApplicationRecord
    has_many :route_points, -> { order(:position) }, dependent: :destroy
    accepts_nested_attributes_for :route_points, reject_if: :all_blank

    belongs_to :town
    belongs_to :user

    validates :name,        length: { minimum: 1, maximum: 35 }, 
                            uniqueness: { scope: :town_id } ,
                            presence: true
    validates :description, length: { maximum: 255 }
    validate  :route_points_limit

  private

  #採用しているAPIのGoogleマップの経由地点が、出発点含め10点までしか登録できないため
  def route_points_limit
    if route_points.size > 10
      errors.add(:route_points, "は10個までしか登録できません")
    end
  end
end
