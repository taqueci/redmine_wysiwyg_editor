FROM ruby:2.6

LABEL maintainer="Takeshi Nakamura"

ARG version=4.1.0
ARG install_dir=/opt/redmine

RUN apt-get update && apt-get install -qq -y sqlite3 git

WORKDIR $install_dir

# Redmine
RUN svn co -q http://svn.redmine.org/redmine/tags/$version .

# Database configuration
RUN echo 'development:\n\
  adapter: sqlite3\n\
  database: db/redmine_development.db\n\
'> config/database.yml

RUN gem update bundler

RUN bundle install --without mysql postgresql rmagick test
RUN bundle exec rake db:migrate

COPY . plugins/redmine_wysiwyg_editor
# RUN git clone https://github.com/slash/redmine_gnr.git plugins/redmine_gnr

RUN bundle install
RUN bundle exec rake redmine:plugins:migrate

RUN bundle exec rake generate_secret_token

EXPOSE 3000
CMD ["bundle", "exec", "rails", "s", "-p", "3000", "-b", "0.0.0.0"]
