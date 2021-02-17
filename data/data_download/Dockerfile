FROM osgeo/gdal:ubuntu-full-3.2.1
LABEL maintainer="hello@vizzuality.com"
ENV PG_MAJOR 13
ENV POSTGIS_MAJOR 3
ENV POSTGIS_VERSION 3.0.1
ENV NODE_OPTIONS=--max_old_space_size=16384
RUN apt-get update \
    && curl -sL https://deb.nodesource.com/setup_13.x | sh - \
    && apt-get install -y --no-install-recommends nodejs make jq \
    && apt-get install -y --no-install-recommends \
           postgresql postgresql-client \
           iputils-ping \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g mapshaper
RUN mkdir -p "gadm_3.6/data" && mkdir -p "wdpa/data" && mkdir -p "iucn/data" && mkdir -p "world_terrestrial_ecosystems/data"
COPY ./gadm_3.6/Makefile ./gadm_3.6/Makefile
COPY ./wdpa/Makefile ./wdpa/Makefile
COPY ./iucn/Makefile ./iucn/Makefile
COPY ./world_terrestrial_ecosystems/Makefile ./world_terrestrial_ecosystems/Makefile
COPY Makefile Makefile
