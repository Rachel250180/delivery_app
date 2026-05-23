# Pin npm packages by running ./bin/importmap

pin "application"

pin "@hotwired/turbo-rails",
    to: "turbo.min.js"

pin "map_url",
    to: "map_url.js"

pin_all_from "app/javascript/map",
              under: "map"
