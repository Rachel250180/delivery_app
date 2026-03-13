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

  #new test
  test "should get new" do
    get new_town_url
    assert_response :success
  end

  #create test

  test "should display routes of town" do
    town = towns(:one)
    route = Route.create!(name: "テストルート", town: town)

    get town_url(town)

    assert_select "li", text: route.name
  end

  #edit test
  test "should get edit" do
    town = towns(:one)

    get edit_town_url(town)
    assert_response :success
  end

  #update test

  test "should update town" do
    town = towns(:one)

    patch town_url(town), params: {town: {name: "更新町"}}

    assert_redirected_to town_url(town)

    town.reload
    assert_equal "更新町", town.name
  end

  #destroy test
  #test "should destroy "

end
