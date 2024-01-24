FROM node:18.14-alpine3.17
LABEL maintainer="hello@vizzuality.com"

ENV NAME marxan-api
ENV USER $NAME
ENV APP_HOME /opt/$NAME
ENV YARN_VERSION 3.6.4

RUN apk add --no-cache bash zip
RUN addgroup $USER && adduser -s /bin/bash -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME
RUN mkdir /tmp/storage && chown $USER /tmp/storage

COPY --chown=$USER:$USER package.json yarn.lock ./
COPY --chown=$USER:$USER .yarnrc.docker.yml .yarnrc.yml
RUN yarn policies set-version $YARN_VERSION
RUN yarn install --immutable

COPY --chown=$USER:$USER nodemon.json tsconfig.json tsconfig.build.json nest-cli.json ./
# @debt we should do this only for images used for tests
COPY --chown=$USER:$USER apps ./apps
COPY --chown=$USER:$USER bin ./bin
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
