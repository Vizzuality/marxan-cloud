FROM node:18.15-bullseye
LABEL maintainer="hello@vizzuality.com"


ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_MAPBOX_API_TOKEN
ARG ENABLE_MAINTENANCE_MODE
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FEATURE_FLAGS
ARG NEXT_PUBLIC_CONTACT_EMAIL

ENV YARN_VERSION 3.5.0
ENV NAME marxan-app
ENV USER $NAME
ENV APP_HOME /opt/$NAME
ENV NEXTAUTH_URL $NEXTAUTH_URL
ENV NEXT_PUBLIC_URL $NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_MAPBOX_API_TOKEN $NEXT_PUBLIC_MAPBOX_API_TOKEN
ENV ENABLE_MAINTENANCE_MODE $ENABLE_MAINTENANCE_MODE
ENV NEXT_PUBLIC_API_URL $NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FEATURE_FLAGS $NEXT_PUBLIC_FEATURE_FLAGS
ENV NEXT_PUBLIC_CONTACT_EMAIL $NEXT_PUBLIC_CONTACT_EMAIL

RUN addgroup --system --gid 1001 $USER
RUN adduser --system --uid 1001 $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY --chown=$USER:$USER .yarnrc.docker.yml .yarnrc.yml

COPY --chown=$USER:$USER package.json yarn.lock next.config.js \
    local.d.ts postcss.config.js tailwind.config.js \
    entrypoint.sh tsconfig.json ./

COPY --chown=$USER:$USER components ./components
COPY --chown=$USER:$USER constants ./constants
COPY --chown=$USER:$USER docs ./docs
COPY --chown=$USER:$USER hoc ./hoc
COPY --chown=$USER:$USER hooks ./hooks
COPY --chown=$USER:$USER images ./images
COPY --chown=$USER:$USER layout ./layout
COPY --chown=$USER:$USER pages ./pages
COPY --chown=$USER:$USER public ./public
COPY --chown=$USER:$USER services ./services
COPY --chown=$USER:$USER store ./store
COPY --chown=$USER:$USER styles ./styles
COPY --chown=$USER:$USER svgs ./svgs
COPY --chown=$USER:$USER types ./types
COPY --chown=$USER:$USER utils ./utils

RUN yarn policies set-version $YARN_VERSION
RUN yarn install --immutable
RUN yarn build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
