Rails.application.routes.draw do
  root "static_pages#home"
  resources :towns do
    resources :routes
  end
end
