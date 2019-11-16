# Editor controller
class EditorController < ApplicationController
  TERM_LEN_PUB_PROJ_MIN = 2
  AUTOCOMPLETE_NUM_MAX = 10
  AVATAR_SIZE = 16

  def users
    term = params[:q] || ''

    proj = Project.find(params[:project])

    raise unless authorized?(proj)

    is_public = (proj.is_public && (term.length >= TERM_LEN_PUB_PROJ_MIN))
    scope = is_public ? User.all : proj.users

    users = scope.active.visible.sorted.like(term)
                 .where.not(id: params[:exclude])
                 .limit(AUTOCOMPLETE_NUM_MAX).to_a

    render json: users.map { |user|
      {
        label: user.name.to_s,
        id: user.id.to_s,
        avatar: avatar_image_tag(user)
      }
    }
  rescue StandardError
    render_error status: 403
  end

  def projects
    render json: Project.visible.sorted.map { |proj|
      {
        id: proj.id.to_s,
        identifier: proj.identifier.to_s,
        name: proj.name.to_s
      }
    }
  rescue StandardError
    render_error status: 403
  end

  def wikis
    proj = Project.find(params[:project_id])

    raise unless authorized?(proj)

    pages = proj.wiki.pages.reorder("#{WikiPage.table_name}.title")

    render json: pages.map { |p|
      {
        title: p.title.to_s
      }
    }
  rescue StandardError
    render_error status: 403
  end

  def authorized?(project)
    User.current.allowed_to?({ controller: 'projects', action: 'show' },
                             project)
  end

  def avatar_image_tag(user)
    avtr = view_context.avatar(user, size: AVATAR_SIZE.to_s)

    avtr.presence ||
      view_context.image_tag('default.png',
                             plugin: 'redmine_wysiwyg_editor',
                             size: AVATAR_SIZE.to_s, class: 'gravatar')
  end
end
