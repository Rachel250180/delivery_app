Rails.application.routes.draw do
  root "static_pages#home"
  resources :routes, only: [ :index, :show, :new, :create ]
end
