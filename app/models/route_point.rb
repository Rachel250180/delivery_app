class RoutePoint < ApplicationRecord
  MAX_ADDRESS_LENGTH = 255

  belongs_to :route

  validates :latitude,
            presence: true,
            numericality: {
              greater_than_or_equal_to: -90,
              less_than_or_equal_to: 90
            }
  validates :longitude,
            presence: true,
            numericality: {
              greater_than_or_equal_to: -180,
              less_than_or_equal_to: 180
            }
  validates :position,
            presence: true,
            numericality: {
              only_integer: true,
              greater_than_or_equal_to: 0
            },
            uniqueness: { scope: :route_id }
  validates :address, length: { maximum: MAX_ADDRESS_LENGTH }
end
