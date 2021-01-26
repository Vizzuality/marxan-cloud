FROM osgeo/gdal:ubuntu-full-latest

RUN apt-get update \
    && curl -sL https://deb.nodesource.com/setup_13.x | sh - \
    && apt-get install -y --no-install-recommends nodejs make \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g mapshaper
RUN mkdir -p "gadm_3.6" && mkdir -p "wdpa" && mkdir -p "iucn" && mkdir -p "WorldTerrestrialEcosystems"
COPY ./gadm_3.6/Makefile-inner ./gadm_3.6/Makefile
COPY ./wdpa/Makefile-inner ./wdpa/Makefile
COPY ./iucn/Makefile-inner ./iucn/Makefile
COPY ./WorldTerrestrialEcosystems/Makefile-inner ./WorldTerrestrialEcosystems/Makefile
