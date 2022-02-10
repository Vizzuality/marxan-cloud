FROM node:14.18-alpine3.15
LABEL maintainer="hello@vizzuality.com"

ENV NAME marxan-api
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup $USER && adduser -s /bin/bash -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME
RUN mkdir /tmp/storage && chown $USER /tmp/storage

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
