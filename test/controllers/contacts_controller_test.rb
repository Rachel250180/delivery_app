require "test_helper"

class ContactsControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get contact_url
    assert_response :success
  end

  test "should create contact" do
    post contact_path, params: {
      name: "テスト",
      email: "test@example.com",
      message: "お問い合わせです"
    }

    assert_response :redirect
  end
end
