class Town < ApplicationRecord
  has_many          :routes, dependent: :destroy

  before_validation :normalize_kana
  validates         :name,
                    presence: true,
                    uniqueness: true,
                    length: { minimum: 2, maximum: 20 }

  private

  def normalize_kana
    return if kana.blank?

    self.kana = kana.tr("ァ-ン", "ぁ-ん")
  end
end
