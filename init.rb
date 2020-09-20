Redmine::Plugin.register :redmine_wysiwyg_editor do
  name 'Redmine WYSIWYG Editor plugin'
  author 'Takeshi Nakamura'
  description 'Redmine WYSIWYG text editor'
  version '0.17.0'
  url 'https://github.com/taqueci/redmine_wysiwyg_editor'
  author_url 'https://github.com/taqueci'
end

require_dependency 'redmine_wysiwyg_editor'
