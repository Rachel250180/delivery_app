require "test_helper"

class SolidCacheConfigurationTest < ActiveSupport::TestCase
  test "test environment uses a writable cache store" do
    assert_instance_of ActiveSupport::Cache::MemoryStore, Rails.cache
  end

  test "solid cache table matches the installed gem schema" do
    columns = ActiveRecord::Base.connection.columns(:solid_cache_entries)
                                    .index_by(&:name)
    indexes = ActiveRecord::Base.connection.indexes(:solid_cache_entries)

    assert_equal %w[byte_size created_at id key key_hash value], columns.keys.sort
    assert_not columns.fetch("key").null
    assert_not columns.fetch("value").null
    assert_not columns.fetch("created_at").null
    assert_not columns.fetch("key_hash").null
    assert_not columns.fetch("byte_size").null
    assert indexes.any? { |index| index.columns == [ "byte_size" ] }
    assert indexes.any? { |index| index.columns == %w[key_hash byte_size] }
    assert indexes.any? { |index| index.columns == [ "key_hash" ] && index.unique }
  end

  test "production solid cache uses the primary connection" do
    cache_config = Rails.root.join("config/cache.yml").read
    production_config = Rails.root.join("config/environments/production.rb").read
    database_config = Rails.root.join("config/database.yml").read

    assert_includes production_config, "config.cache_store = :solid_cache_store"
    assert_no_match(/^\s*(database|databases|connects_to):/, cache_config)
    assert_no_match(/CACHE_DATABASE_URL/, database_config)
    assert_no_match(/^\s+cache:/, database_config)
  end
end
