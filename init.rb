Redmine::Plugin.register :redmine_wysiwyg_editor do
  name 'Redmine WYSIWYG Editor plugin'
  author 'Takeshi Nakamura'
  description 'Redmine WYSIWYG text editor'
  version '0.32.0'
  url 'https://github.com/taqueci/redmine_wysiwyg_editor'
  author_url 'https://github.com/taqueci'

  project_module :visual_editor do
    permission :use_visual_editor, { redmine_wysiwyg_editor: [] },
               public: true, require: :member
  end

  settings default: { settings_visual_editor_mode_switch_tab: '' },
           partial: 'redmine_wysiwyg_editor/setting'
end

require File.expand_path('lib/redmine_wysiwyg_editor', __dir__)
