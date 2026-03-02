require "application_system_test_case"

class DummyTest < ApplicationSystemTestCase
  test "visiting the home page" do
    visit "/"
    assert_selector "h1"
  end
end
