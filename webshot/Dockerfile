FROM node:16.14.0-alpine3.15
LABEL maintainer="hello@vizzuality.com"

ENV NAME marxan-webshot
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup $USER && adduser -s /bin/bash -D -G $USER $USER

RUN apk add --update \
    bash \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

COPY --chown=$USER:$USER package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$USER:$USER entrypoint.sh ./
COPY --chown=$USER:$USER src ./src
COPY --chown=$USER:$USER config ./config
COPY --chown=$USER:$USER tsconfig.json tsconfig.build.json nodemon.json ./
COPY --chown=$USER:$USER config ./config

RUN yarn prestart:prod

EXPOSE 3000
USER $USER

ENTRYPOINT ["sh", "./entrypoint.sh"]
