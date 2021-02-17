FROM node:14.15.5-alpine3.13
LABEL maintainer="hello@vizzuality.com"

ENV NAME marxan-geoprocessing
ENV USER $NAME

RUN addgroup -S $USER && adduser -S $USER -G $USER

WORKDIR /opt/$NAME

COPY package.json ./package.json
# COPY yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

COPY entrypoint.sh ./entrypoint.sh
COPY nodemon.json ./nodemon.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY config ./config
COPY ormconfig.ts ./ormconfig.ts


COPY ./src ./src

RUN yarn prestart:prod

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
