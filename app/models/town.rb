class Town < ApplicationRecord
    has_many :routes, dependent: :destroy
    validates :name, presence: true,
                     uniqueness: true,
                     length: { minimum: 3, maximum: 20 }
end
