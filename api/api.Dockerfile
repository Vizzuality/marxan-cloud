FROM node:14.18-alpine3.15
LABEL maintainer="hello@vizzuality.com"

ENV NAME marxan-api
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup $USER && adduser -s /bin/bash -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME
RUN mkdir /tmp/storage && chown $USER /tmp/storage

COPY --chown=$USER:$USER package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$USER:$USER nodemon.json tsconfig.json tsconfig.build.json nest-cli.json ./
# @debt we should do this only for images used for tests
COPY --chown=$USER:$USER apps ./apps
COPY --chown=$USER:$USER libs ./libs

RUN mkdir -p /opt/marxan-project-cloning
RUN chown -R $USER:$USER /opt/marxan-project-cloning

# By deleting the full geoprocessing source tree we strictly enforce that no
# direct or indirect dependencies between geoprocessing and api may
# accidentally sneak in.
RUN rm -rf apps/geoprocessing && yarn prestart:prod api

EXPOSE 3000
USER $USER

ENTRYPOINT ["./apps/api/entrypoint.sh"]
