FROM osgeo/gdal:ubuntu-full-3.2.1
ENV LANG=en_US.UTF-8
LABEL maintainer="hello@vizzuality.com"
ENV NODE_OPTIONS=--max_old_space_size=16384
RUN apt-get update \
    && curl -sL https://deb.nodesource.com/setup_13.x | sh - \
    && apt-get install -y --no-install-recommends nodejs make jq \
    && apt-get install -y --no-install-recommends \
           postgresql postgresql-client \
           iputils-ping \
           time \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g mapshaper
# RUN mkdir -p "gadm_3.6/data" && mkdir -p "wdpa/data" && mkdir -p "iucn/data" && mkdir -p "world_terrestrial_ecosystems/data"
COPY ./ ./
