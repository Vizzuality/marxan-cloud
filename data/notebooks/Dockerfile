FROM jupyter/datascience-notebook:python-3.8.6

SHELL [ "/bin/bash", "-l", "-c" ]

USER root
ENV NVM_DIR /usr/local/nvm
ENV CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3-rtree \
    software-properties-common \
    graphviz \
    ca-certificates \
    build-essential \
    libsqlite3-dev \
    zlib1g-dev \
    manpages-dev \
    curl && \
    add-apt-repository -y ppa:ubuntu-toolchain-r/test && apt update -q -y && \
    apt install -q -y g++ && export CXX=g++ && \
    mkdir -p "$NVM_DIR"; \
    curl -o- \
        "https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh" | \
        bash \
    ; \
    source $NVM_DIR/nvm.sh; \
    nvm install --lts --latest-npm \
    && npm install @mapbox/mapbox-gl-style-spec --global

RUN git clone https://github.com/mapbox/tippecanoe.git && \
	cd tippecanoe && \
	make -j && make install && cd ..
RUN export CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

# also bugg for jupyter lab# nbdime \
RUN pip install jupyter_contrib_nbextensions \
                jupyter_nbextensions_configurator \
                version_information \
                jupyterlab \
                nbdev \
                autopep8 \
                vega \
                ipyleaflet \
                jupyterlab_templates \
                pandas \
                qgrid

# Having to install gdal through conda gaves me chills; trying installing it through pip is failing badly. no time to dig depply on what is going on probably issues with path.
RUN conda update -n base conda && conda install -c conda-forge \
            python-blosc \
            cytoolz \
            gdal \
            dask \
            xhistogram \
            lz4 \
            nomkl \
            dask-labextension \
            python-graphviz \
            tini \
            xarray \
            jupyterlab_widgets

# Enable extensions nbdime support for lab3 is still in progress#jupyter labextension install nbdime-jupyterlab && \
#jupyter labextension install jupyterlab_templates && \
#jupyter serverextension enable --py jupyterlab_templates && \
#&& \
# jupyter labextension install qgrid2

RUN jupyter contrib nbextension install --sys-prefix && \
    jupyter nbextension install --sys-prefix --py vega && \
    jupyter nbextension enable vega --py --sys-prefix &&  \
    jupyter nbextensions_configurator enable  && \
    jupyter nbextension enable --py --sys-prefix ipyleaflet && \
    jupyter nbextension enable --py --sys-prefix qgrid && \
    jupyter labextension install jupyterlab_templates && \
    jupyter serverextension enable --py jupyterlab_templates

# Add requirements file
COPY jupyter_server_config.py /etc/jupyter/
COPY requirements.txt /app/
RUN pip install wheel -r /app/requirements.txt
RUN mkdir /opt/app
# Jupyter with Docker Compose
EXPOSE 8888
