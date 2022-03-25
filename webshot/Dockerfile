FROM node:16.14.0
LABEL maintainer="hello@vizzuality.com"

ENV NAME marxan-webshot
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

RUN apt-get update && apt-get install -y google-chrome-stable libxtst6 libxss1 --no-install-recommends

# Add Chrome as a user
RUN groupadd -r $USER && useradd -r -g $USER -G audio,video $USER \
    && mkdir -p /home/$USER && chown -R $USER:$USER /home/$USER

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
