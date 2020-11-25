FROM node:14.15.1-alpine
LABEL maintainer="hello@vizzuality.com"

ENV NAME marxan-app
ENV USER $NAME

RUN addgroup -S $USER && adduser -S $USER -G $USER

WORKDIR /opt/$NAME

COPY entrypoint.sh ./entrypoint.sh

COPY dummy.js ./dummy.js

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
