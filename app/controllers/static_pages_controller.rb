class StaticPagesController < ApplicationController
  def home
    @town = Town.first || Town.new
  end
end
