FROM node:erbium-alpine3.12
LABEL maintainer="hello@vizzuality.com"

ARG UID
ARG GID

ENV NAME marxan-app
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup -g $GID $USER && adduser -u $UID -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY --chown=$USER:$USER package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$USER:$USER entrypoint.sh local.d.ts next-env.d.ts next.config.js postcss.config.js tailwind.config.js tsconfig.json ./

RUN yarn build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]