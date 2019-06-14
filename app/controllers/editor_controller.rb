class EditorController < ApplicationController
  TERM_LEN_PUB_PROJ_MIN = 2
  AUTOCOMPLETE_NUM_MAX = 10
  AVATAR_SIZE = 16

  before_action :require_login

  def users
    term = params[:q] || ''

    proj = Project.find(params[:project])

    raise unless authorized?(proj)

    scope = (proj.is_public && (term.length >= TERM_LEN_PUB_PROJ_MIN)) ?
              User.all : proj.users

    users = scope.active.visible.sorted.like(term)
              .where.not(id: params[:exclude])
              .limit(AUTOCOMPLETE_NUM_MAX).to_a

    render json: users.map {|user|
      {
        label: user.name.to_s,
        id: user.id.to_s,
        avatar: avatar_image_tag(user)
      }
    }
  rescue
    render_error status: 403
  end

  def authorized?(project)
    User.current.allowed_to?({controller: 'projects', action: 'show'}, project)
  end

  def avatar_image_tag(user)
    avtr = view_context.avatar(user, size: AVATAR_SIZE.to_s)

    avtr.blank? ?
      view_context.image_tag('default.png', plugin: 'redmine_wysiwyg_editor',
                             size: AVATAR_SIZE.to_s, class: 'gravatar') :
      avtr
  end
end
