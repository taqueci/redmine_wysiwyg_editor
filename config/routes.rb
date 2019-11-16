RedmineApp::Application.routes.draw do
  get '/editor/users', to: 'editor#users'
  get '/editor/projects', to: 'editor#projects'
  get '/editor/projects/:project_id/wikis', to: 'editor#wikis'
end
