FROM osgeo/gdal:ubuntu-full-3.2.1
LABEL maintainer="hello@vizzuality.com"
ENV NODE_OPTIONS=--max_old_space_size=16384

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
           postgresql postgresql-client \
           iputils-ping \
           time nodejs make jq \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g mapshaper@0.5.67

COPY ./ ./
