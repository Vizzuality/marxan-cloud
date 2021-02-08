FROM osgeo/gdal:ubuntu-full-latest
ENV NODE_OPTIONS=--max_old_space_size=16384
RUN apt-get update \
    && curl -sL https://deb.nodesource.com/setup_13.x | sh - \
    && apt-get install -y --no-install-recommends nodejs make jq \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g mapshaper
RUN mkdir -p "gadm_3.6/data" && mkdir -p "wdpa/data" && mkdir -p "iucn/data" && mkdir -p "WorldTerrestrialEcosystems/data"
COPY ./gadm_3.6/Makefile ./gadm_3.6/Makefile
COPY ./wdpa/Makefile ./wdpa/Makefile
COPY ./iucn/Makefile ./iucn/Makefile
COPY ./WorldTerrestrialEcosystems/Makefile ./WorldTerrestrialEcosystems/Makefile
COPY Makefile Makefile
