FROM ruby:2.6-alpine

LABEL maintainer="Takeshi Nakamura"

ARG version=4.1.1
ARG install_dir=/opt/redmine

WORKDIR $install_dir

# Redmine
RUN wget -O redmine.tar.gz \
         "https://www.redmine.org/releases/redmine-${version}.tar.gz"; \
     tar -xf redmine.tar.gz --strip-components=1

# Database configuration
RUN \
    echo 'development:' > config/database.yml; \
    echo '  adapter: sqlite3' >> config/database.yml; \
    echo '  database: db/redmine.sqlite3' >> config/database.yml

# Dependencies installation
RUN apk update && \
    apk add --no-cache sqlite sqlite-libs tzdata xz-libs  && \
    apk add --no-cache --virtual .build-deps \
        build-base libxml2-dev libxslt-dev sqlite-dev && \
    bundle install --without mysql postgresql rmagick test && \
    apk del --no-cache --purge .build-deps

COPY . plugins/redmine_wysiwyg_editor

RUN bundle exec rake db:migrate && \
    bundle exec rake redmine:plugins:migrate && \
    bundle exec rake generate_secret_token

EXPOSE 3000
CMD ["bundle", "exec", "rails", "s", "-p", "3000", "-b", "0.0.0.0"]
