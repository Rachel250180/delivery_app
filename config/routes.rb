Rails.application.routes.draw do
  get "contacts/new"
  get "contacts/create"
  get "password_resets/new"
  get "password_resets/edit"
  get "sessions/new"
  root "static_pages#home"
  get  "/contact", to: "static_pages#contact"
  get "/signup", to: "users#new"
  get    "/login",   to: "sessions#new"
  post   "/login",   to: "sessions#create"
  delete "/logout",  to: "sessions#destroy"

  resources :users
  resources :account_activations, only: [ :edit ]
  resources :password_resets,     only: [ :new,  :create, :edit, :update ]
  resources :towns do
    resources :routes
  end
  resources :contacts, only: [ :new, :create ]
end
