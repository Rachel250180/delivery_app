# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_27_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "route_points", force: :cascade do |t|
    t.string "address"
    t.datetime "created_at", null: false
    t.float "latitude", null: false
    t.float "longitude", null: false
    t.integer "position", null: false
    t.bigint "route_id", null: false
    t.datetime "updated_at", null: false
    t.index ["route_id", "position"], name: "index_route_points_on_route_id_and_position", unique: true
    t.index ["route_id"], name: "index_route_points_on_route_id"
    t.check_constraint "\"position\" >= 0", name: "route_points_position_non_negative"
    t.check_constraint "latitude >= '-90'::integer::double precision AND latitude <= 90::double precision", name: "route_points_latitude_range"
    t.check_constraint "longitude >= '-180'::integer::double precision AND longitude <= 180::double precision", name: "route_points_longitude_range"
  end

  create_table "routes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "estimated_duration"
    t.string "name", null: false
    t.bigint "town_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["town_id", "name"], name: "index_routes_on_town_id_and_name", unique: true
    t.index ["town_id"], name: "index_routes_on_town_id"
    t.index ["user_id"], name: "index_routes_on_user_id"
    t.check_constraint "estimated_duration >= 0", name: "routes_estimated_duration_non_negative"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.datetime "created_at", null: false
    t.binary "key", null: false
    t.bigint "key_hash", null: false
    t.binary "value", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "towns", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "kana"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_towns_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.boolean "activated", default: false, null: false
    t.datetime "activated_at"
    t.string "activation_digest"
    t.datetime "activation_sent_at"
    t.boolean "admin", default: false, null: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.string "remember_digest"
    t.string "reset_digest"
    t.datetime "reset_sent_at"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "route_points", "routes"
  add_foreign_key "routes", "towns"
  add_foreign_key "routes", "users"
end
