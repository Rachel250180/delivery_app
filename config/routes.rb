Rails.application.routes.draw do
  root "static_pages#home"
  get "/signup", to: "users#new"
  resources :towns do
    resources :routes
  end
  resources :users
end
