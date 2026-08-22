Rails.application.routes.draw do
  root   "static_pages#home"
  get    "/contact",     to: "static_pages#contact"
  get    "/signup",      to: "users#new"
  get    "/login",       to: "sessions#new"
  post   "/login",       to: "sessions#create"
  post   "/guest_login", to: "sessions#guest_login"
  delete "/logout",      to: "sessions#destroy"

  resources :users, only: [ :create, :show, :edit, :update ]
  resources :account_activations, only: [ :edit ]
  resource  :account_activation_resend, only: [ :show, :create ]
  resources :password_resets,     only: [ :new,  :create, :edit, :update ]
  resources :towns do
    resources :routes
  end
  resources :contacts, only: [ :new, :create ]
end
