require "test_helper"

class TownsControllerTest < ActionDispatch::IntegrationTest

  #index test

  test "should get index and show towns in index" do
    town = towns(:one)

    get towns_url
    assert_response :success
    assert_select "li", text: town.name
  end

    #show test

  test "should show town and display town name" do
    town = towns(:one)

    get town_url(town)
    assert_response :success
    assert_select "h1", /#{town.name}/
  end

  test "should display routes of town" do
    town = towns(:one)
    route = Route.create!(name: "テストルート", town: town)

    get town_url(town)

    assert_select "li", text: route.name
  end
end
