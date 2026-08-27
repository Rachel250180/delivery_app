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

  test "delivery failure redisplays contact form with entered values" do
    delivery = Object.new
    delivery.define_singleton_method(:deliver_now) do
      raise Net::SMTPFatalError, "SMTP failed"
    end
    original_method = ContactMailer.method(:contact_email)
    ContactMailer.define_singleton_method(:contact_email) { |*| delivery }

    begin
      post contacts_path, params: contact_params(email: "failed@example.com")
    ensure
      ContactMailer.define_singleton_method(:contact_email) do |*args|
        original_method.call(*args)
      end
    end

    assert_response :service_unavailable
    assert_select "#error_explanation", text: /お問い合わせの送信に失敗しました/
    assert_select "input[name='contact[name]'][value='テスト']"
    assert_select "input[name='contact[email]'][value='failed@example.com']"
    assert_select "textarea[name='contact[message]']", text: "お問い合わせです"
  end

  test "unexpected contact email error is not rescued" do
    original_method = ContactMailer.method(:contact_email)
    ContactMailer.define_singleton_method(:contact_email) do |*|
      raise ArgumentError, "programming error"
    end

    begin
      assert_raises(ArgumentError) do
        post contacts_path, params: contact_params(email: "unexpected@example.com")
      end
    ensure
      ContactMailer.define_singleton_method(:contact_email) do |*args|
        original_method.call(*args)
      end
    end
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
