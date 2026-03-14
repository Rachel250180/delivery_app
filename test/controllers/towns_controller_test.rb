require "test_helper"

class TownsControllerTest < ActionDispatch::IntegrationTest

  setup do
    @town = towns(:one)
  end

  test "should get index and show towns in index" do
    get towns_url
    assert_response :success
    assert_select "li", text: @town.name
  end

  test "should show town and display town name" do
    get town_url(@town)
    assert_response :success
    assert_select "h1", /#{@town.name}/
  end

  test "should get new" do
    get new_town_url
    assert_response :success
  end

  test "should create town" do
    assert_difference("Town.count") do
      post towns_url, params: {
        town: {
          name:        "test town",
          description: "test description"
        }
      }
    end

    assert_redirected_to new_town_route_path(Town.last)
  end

  test "should not create town with invalid data" do
    assert_no_difference("Town.count") do
      post towns_url, params: {
        town:{
          name:        "",
          description: "test description"
        }
      }
    end

    assert_response :unprocessable_entity
  end

  test "should display routes of town" do
    route = Route.create!(name: "テストルート", town: @town)

    get town_url(@town)

    assert_select "li", text: route.name
  end

  test "should get edit" do
    get edit_town_url(@town)
    assert_response :success
  end

  test "should update town" do
    patch town_url(@town), params: {town: {name: "更新町"}}

    assert_redirected_to town_url(@town)

    @town.reload
    assert_equal "更新町", @town.name
  end

  test "should destroy town" do
    assert_difference("Town.count", -1) do
      delete town_url(@town)
    end

    assert_redirected_to towns_path
  end
end
