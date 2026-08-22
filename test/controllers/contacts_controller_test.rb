require "test_helper"

class ContactsControllerTest < ActionDispatch::IntegrationTest
  def setup
    Rails.cache.clear
    ActionMailer::Base.deliveries.clear
  end

  test "should get new" do
    get new_contact_url
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

  test "IP rate limit returns too many requests" do
    5.times do |index|
      post contacts_path,
           params: contact_params(email: "ip-limit-#{index}@example.com"),
           headers: { "REMOTE_ADDR" => "192.0.2.10" }
      assert_redirected_to root_path
    end

    post contacts_path,
         params: contact_params(email: "ip-limit-last@example.com"),
         headers: { "REMOTE_ADDR" => "192.0.2.10" }

    assert_response :too_many_requests
  end

  test "email rate limit returns too many requests" do
    3.times do
      post contacts_path, params: contact_params(email: "limited@example.com")
      assert_redirected_to root_path
    end

    post contacts_path, params: contact_params(email: "limited@example.com")

    assert_response :too_many_requests
  end

  private

    def contact_params(email:)
      {
        contact: {
          name: "テスト",
          email: email,
          message: "お問い合わせです"
        }
      }
    end
end
