RedmineApp::Application.routes.draw do
  get '/editor/users', to: 'editor#users'
end
