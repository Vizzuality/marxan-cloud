FROM node:14.15.5-alpine3.13
LABEL maintainer="hello@vizzuality.com"

ARG UID
ARG GID

ENV NAME marxan-geoprocessing
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup -g $GID $USER && adduser -u $UID -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$USER:$USER entrypoint.sh nodemon.json tsconfig.json tsconfig.build.json ormconfig.ts ./
COPY --chown=$USER:$USER config ./config
COPY --chown=$USER:$USER src ./src
# @debt we should do this only for images used for tests
COPY --chown=$USER:$USER test ./test

RUN yarn prestart:prod

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
