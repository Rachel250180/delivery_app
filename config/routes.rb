Rails.application.routes.draw do
  get    "password_resets/new"
  get    "password_resets/edit"
  get    "sessions/new"
  root   "static_pages#home"
  get    "/contacts",    to: "contacts#new"
  post   "/contacts",    to: "contacts#create"
  get    "/contact",     to: "static_pages#contact"
  get    "/signup",      to: "users#new"
  get    "/login",       to: "sessions#new"
  post   "/login",       to: "sessions#create"
  post   "/guest_login", to: "sessions#guest_login"
  delete "/logout",      to: "sessions#destroy"

  resources :users
  resources :account_activations, only: [ :edit ]
  resource  :account_activation_resend, only: [ :show, :create ]
  resources :password_resets,     only: [ :new,  :create, :edit, :update ]
  resources :towns do
    resources :routes
  end
  resources :contacts, only: [ :new, :create ]
end
