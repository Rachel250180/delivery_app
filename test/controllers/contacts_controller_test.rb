require "test_helper"

class ContactsControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get contact_url
    assert_response :success
  end

  test "should create contact" do
    post contacts_path, params: {
      contact: {
        name: "テスト",
        email: "test@example.com",
        message: "お問い合わせです"
      }
    }

    assert_redirected_to root_path
  end
end
