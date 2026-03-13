class Town < ApplicationRecord
    has_many :routes
    validates :name, presence: true, length: {minimum: 3, maximum:20 }
end
