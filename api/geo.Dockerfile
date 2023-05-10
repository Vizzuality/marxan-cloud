FROM node:14.18-alpine3.15
LABEL maintainer="hello@vizzuality.com"

ENV NAME marxan-geoprocessing
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup $USER && adduser -s /bin/bash -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

RUN mkdir -p /opt/marxan-project-cloning
RUN chown -R $USER:$USER /opt/marxan-project-cloning

USER $USER

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$USER:$USER nodemon.json tsconfig.json tsconfig.build.json nest-cli.json ./
# @debt we should do this only for images used for tests
COPY --chown=$USER:$USER apps ./apps
COPY --chown=$USER:$USER libs ./libs

RUN mkdir -p ./test/integration/protected-areas/steps/new-shape-name
RUN chown $USER ./test/integration/protected-areas/steps/new-shape-name

RUN chown -R $USER:$USER ./test/integration

RUN mkdir -p ./test/integration/protected-areas/steps/test_multiple_features_v2

# By deleting the full api source tree we strictly enforce that no direct or
# indirect dependencies between api and geoprocessing may accidentally sneak in.
RUN rm -rf apps/api && yarn prestart:prod geoprocessing

EXPOSE 3000
ENTRYPOINT ["./apps/geoprocessing/entrypoint.sh"]
