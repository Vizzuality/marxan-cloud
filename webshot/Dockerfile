FROM node:16.14.0-alpine3.15
LABEL maintainer="hello@vizzuality.com"

ENV NAME mgis-webshot
ENV USER mgis

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

WORKDIR /opt/$NAME
COPY . .
RUN yarn install --frozen-lockfile
# RUN yarn build

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
