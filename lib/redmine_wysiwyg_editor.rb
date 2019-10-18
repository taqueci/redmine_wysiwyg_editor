# Redmine WYSIWYG Editor hook listener
class RedmineWysiwygEditorHookListener < Redmine::Hook::ViewListener
  render_on :view_layouts_base_html_head,
            partial: 'redmine_wysiwyg_editor/redmine_wysiwyg_editor_partial'
end
