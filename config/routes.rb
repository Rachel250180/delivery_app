Rails.application.routes.draw do
  root "routes#index"
  resources :routes, only: [:index, :show, :new, :create]
end