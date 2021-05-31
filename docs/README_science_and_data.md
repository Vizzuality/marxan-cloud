### Marxan - Overview
Marxan is the most widely used decision-support software for conservation planning globally, and supports the design of cost-efficient networks that meet conservation targets for biodiversity.

<<<<<<< HEAD
* [User manual](https://marxansolutions.org/wp-content/uploads/2020/04/Marxan_User_Manual_2008.pdf)
=======
* [User manual](https://marxansolutions.org/wp-content/uploads/2021/02/Marxan-User-Manual_2021.pdf)
>>>>>>> fbf3f123f8cc06fb4b1eda6e3680ba304ca80149
* [Best practices](https://marxansolutions.org/wp-content/uploads/2020/04/Marxan-Good-Practices-Handbook-v2-2013.pdf)
* [Tutorial](https://marxansolutions.org/wp-content/uploads/2020/04/Tutorial.zip)
* [Marxan web](https://app.marxanweb.org/)

### Dataset providers:
* [Administrative Regions](https://d1gam3xoknrgr2.cloudfront.net/current/WDPA_WDOECM_wdpa_shp.zip)
* [Protected Areas](https://d1gam3xoknrgr2.cloudfront.net/current/WDPA_WDOECM_wdpa_shp.zip)
* [GBIF](https://api.gbif.org/v1/)
* [Human footprint](https://figshare.com/articles/Global_Human_Modification/7283087)
* [Species range datasets](https://www.iucnredlist.org/resources/spatial-data-download)
* [World Terrestrial Ecosystems](https://www.arcgis.com/home/item.html?id=140af3e5389a4afcb421ee4633d18d3a)


## Data processing Architecture
![Marxan api architecture](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Vizzuality/marxan-cloud/feature/add-new-services-processing/marxan-api-architecture.puml)
![Data processing architecture](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Vizzuality/marxan-cloud/develop/marxan-data-processing-architecture.puml)

Datasets with a size lower than 5gb, will have a full automated pipe and be directly stored on the Geo-processing DB as part of the initial available data; this includes:  
* Protected Areas 
* Administrative regions
* World Terrestrial Ecosystems  

For those datasets that are over 5gb in terms of storage; a different approach is needed; this will be an on demand one, similar to what Andrew did for GBIF, and will have a pipe triggered by user needs trying to avoid as much as possible duplicities in storage: 
* GBIF
* IUCN species range
* Human footprint 
* Hansen forest cover
### Database model
[DB data model](https://dbdiagram.io/embed/5ff8693580d742080a358e7f)


## Geoprocessing operations.

This are the main operations handled by the service
* Format conversion
* Re-projection
* Validation
* Geometry sanitization (Repair and simplification)
* Spatial intersection
* Area calculation
* Split by property
* Stratification; special spatial intersection

## Vector tile service

* Serve vector tiles from the db on the fly with a Redis cache upfront


### For the future:
* Raster management

## Data transformation operations (TBD)


## Data calculations (TBD)
### Targets (TBD)

### BLM calibration (TBD)


## Marxan executer (TBD)

## data postprocessing (TBD)
### Targets (TBD)
### Solutions (TBD)
