FROM node:16.13-alpine3.15
LABEL maintainer="hello@vizzuality.com"

ARG UID
ARG GID
ARG UPLOADS_TEMP_DIR

ENV NAME marxan-api
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup -g $GID $USER && adduser -u $UID -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME
RUN mkdir $UPLOADS_TEMP_DIR && chown $USER $UPLOADS_TEMP_DIR

USER $USER

COPY --chown=$USER:$USER package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$USER:$USER nodemon.json tsconfig.json tsconfig.build.json ./
# @debt we should do this only for images used for tests
COPY --chown=$USER:$USER apps ./apps
COPY --chown=$USER:$USER libs ./libs

RUN yarn prestart:prod

EXPOSE 3000
ENTRYPOINT ["./apps/api/entrypoint.sh"]
