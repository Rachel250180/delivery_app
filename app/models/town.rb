class Town < ApplicationRecord
  before_validation :nomalize_kana
  has_many :routes, dependent: :destroy
  validates :name,  presence: true,
                    uniqueness: true,
                    length: { minimum: 2, maximum: 20 }

  private

  def nomalize_kana
    return if kana.blank?

    self.kana = kana.tr("ァ-ン", "ぁ-ん")
  end
end
