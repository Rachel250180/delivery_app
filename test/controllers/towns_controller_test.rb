require "test_helper"

class TownsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @town = towns(:one)
    @user = users(:michael)
    log_in_as(@user)
  end

  test "should get index and show towns in index" do
    get towns_url
    assert_response :success
    assert_select "li", text: @town.name
    assert_select "script[data-google-maps-script]", count: 0
    assert_select "a[href='#{new_town_path}']", count: 1
  end

  test "should show town and display town name" do
    get town_url(@town)
    assert_response :success
    assert_select "h1", /#{@town.name}/
    assert_select "a[href='#{new_town_route_path(@town)}']", count: 1
    assert_select "a[href='#{edit_town_path(@town)}']", count: 1
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
        town: {
        name:        "",
        description: "test description"
        }
      }
    end

    assert_response :unprocessable_entity
  end

  test "should display routes of town" do
    route = Route.new(name: "テストルート",
                      description: "説明",
                      town: @town,
                      user: @user)
    route.route_points.build(latitude: 35.0, longitude: 139.0, position: 0)
    route.save!

    get town_url(@town)

    assert_select "h1", "#{@town.name}のルート一覧"
    assert_select "a", route.name
  end

  test "non-admin does not see town management links" do
    log_in_as(users(:archer))

    get towns_url
    assert_select "a[href='#{new_town_path}']", count: 0

    get town_url(@town)
    assert_select "a[href='#{edit_town_path(@town)}']", count: 0
    assert_select "a[href='#{new_town_route_path(@town)}']", count: 1
  end

  test "should get edit" do
    get edit_town_url(@town)
    assert_response :success
    assert_select "[data-turbo-confirm*='この町を削除']", count: 1
  end

  test "should update town" do
    patch town_url(@town), params: { town: { name: "更新町" } }

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
