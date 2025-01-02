Redmine::Plugin.register :redmine_wysiwyg_editor do
  name 'Redmine WYSIWYG Editor plugin'
  author 'Takeshi Nakamura'
  description 'Redmine WYSIWYG text editor'
  version '0.34.0'
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

def create_non_digested_tinymce_assets
  plugin_asset_path = 'public/assets/plugin_assets/redmine_wysiwyg_editor'
  assets = Dir.glob(Rails.root.join(plugin_asset_path, 'tinymce', '**/*'))

  digest_pattern = /-([a-f0-9]{8})\./

  assets.each do |file|
    next unless file =~ digest_pattern

    source = file.split('/')
    source.push(source.pop.gsub(digest_pattern, '.'))

    non_digested = File.join(source)
    FileUtils.cp(file, non_digested)
  end
end

if Redmine::VERSION.to_s >= '6.0.0'
  # Workaround for TinyMCE asset file access issue
  create_non_digested_tinymce_assets
end
