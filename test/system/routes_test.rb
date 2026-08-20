require "application_system_test_case"

class RoutesCreateTest < ApplicationSystemTestCase
  setup do
    @user = users(:michael)
    @town = towns(:one)

    visit login_path

    fill_in "session_email", with: @user.email
    fill_in "session_password", with: "password"

    click_button "ログイン"
    assert_current_path(user_path(@user))
  end

  test "making route" do
    visit new_town_route_path(@town)

    assert_selector "#route-form", wait: 5

    fill_in "ルート名", with: "テストルート"
    fill_in "所要時間（分）", with: 60
    fill_in "備考欄", with: "テスト"

    execute_script <<~JS
      document.querySelector('#points_json').value =
        JSON.stringify([{lat:35,lng:139,address:"test"}]);
    JS

    click_button "登録する"

    assert_text "ルートを作成しました。"
  end

  test "Cannot create if there are 10 or more delivery points" do
    visit new_town_route_path(@town)

    fill_in "ルート名", with: "テストルート"

    page.execute_script(<<~JS)
      const points = [];

      for (let i = 0; i < 10; i++) {
        points.push({
          lat: 35 + i,
          lng: 139 + i,
          address: `地点${i}`
        });
      }

      document.getElementById("points_json").value =
        JSON.stringify(points);
    JS

    assert_no_difference("Route.count") do
      find(".btn-add").click
    end

    assert_text "は9個までしか登録できません"
  end
end
