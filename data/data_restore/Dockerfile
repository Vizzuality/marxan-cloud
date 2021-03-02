FROM osgeo/gdal:ubuntu-full-3.2.1
LABEL maintainer="hello@vizzuality.com"
RUN apt-get update \
    && apt-get install -y --no-install-recommends make jq \
           postgresql postgresql-client \
    && rm -rf /var/lib/apt/lists/*
COPY ./ ./
