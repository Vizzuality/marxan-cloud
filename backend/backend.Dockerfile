FROM node:14.15.5-alpine3.13
LABEL maintainer="hello@vizzuality.com"

ARG UID
ARG GID

ENV NAME marxan-api
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup -g $GID $USER && adduser -u $UID -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY --chown=$USER:$USER ./package.json ./yarn.lock ./nest-cli.json ./
COPY --chown=$USER:$USER ./tsconfig.json .
RUN yarn install --frozen-lockfile

COPY --chown=$USER:$USER apps/backend/entrypoint.sh apps/backend/tsconfig.build.json ./
COPY --chown=$USER:$USER apps ./apps
COPY --chown=$USER:$USER libs ./libs
COPY --chown=$USER:$USER config ./config

RUN yarn prestart:backend

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
