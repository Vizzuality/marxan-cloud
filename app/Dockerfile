FROM node:14.19-alpine3.15
LABEL maintainer="hello@vizzuality.com"

ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_MAPBOX_API_TOKEN
ARG NEXT_PUBLIC_API_URL

ENV NAME marxan-app
ENV USER $NAME
ENV APP_HOME /opt/$NAME
ENV NEXTAUTH_URL $NEXTAUTH_URL
ENV NEXT_PUBLIC_URL $NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_MAPBOX_API_TOKEN $NEXT_PUBLIC_MAPBOX_API_TOKEN
ENV NEXT_PUBLIC_API_URL $NEXT_PUBLIC_API_URL

RUN addgroup $USER && adduser -s /bin/bash -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY --chown=$USER:$USER package.json yarn.lock next.config.js \
    next-env.d.ts local.d.ts postcss.config.js tailwind.config.js \
    cypress.json entrypoint.sh tsconfig.json ./

COPY --chown=$USER:$USER .storybook ./.storybook
COPY --chown=$USER:$USER components ./components
COPY --chown=$USER:$USER constants ./constants
COPY --chown=$USER:$USER cypress ./cypress
COPY --chown=$USER:$USER docs ./docs
COPY --chown=$USER:$USER email-templates ./email-templates
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

RUN yarn install --frozen-lockfile

RUN yarn build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
