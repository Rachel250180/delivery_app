require "test_helper"

class StaticPagesControllerTest < ActionDispatch::IntegrationTest
  test "should get root" do
    get root_url
    assert_response :success
  end

  test "should get contact" do
    get contact_path
    assert_response :success
    assert_select "title", "contact"
  end
end
