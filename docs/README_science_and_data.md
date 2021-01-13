### Marxan - Overview
Marxan is the most widely used decision-support software for conservation planning globally, and supports the design of cost-efficient networks that meet conservation targets for biodiversity.

[User manual](https://marxansolutions.org/wp-content/uploads/2020/04/Marxan_User_Manual_2008.pdf)
[Best practices](https://marxansolutions.org/wp-content/uploads/2020/04/Marxan-Good-Practices-Handbook-v2-2013.pdf)
[Tutorial](https://marxansolutions.org/wp-content/uploads/2020/04/Tutorial.zip)
[Marxan web](https://app.marxanweb.org/)

### Dataset providers:
* [Protected Areas](https://d1gam3xoknrgr2.cloudfront.net/current/WDPA_WDOECM_wdpa_shp.zip)
* [GBIF](https://api.gbif.org/v1/)
* [Human footprint](https://figshare.com/articles/Global_Human_Modification/7283087)
* [Species range datasets](https://www.iucnredlist.org/resources/spatial-data-download)
* [World Terrestrial Ecosystems](https://www.arcgis.com/home/item.html?id=140af3e5389a4afcb421ee4633d18d3a)


## Data processing Architecture
![alternative text](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Vizzuality/marxan-cloud/feature/add-new-services-processing/marxan-data-processing-architecture.puml)


## Geoprocessing operations.

![alternative text](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Vizzuality/marxan-cloud/feature/add-new-services-processing/marxan-geoprocessing-architecture.puml)

This are the main operations handled by the service
* Format conversion
* Reprojection
* Validation
* Geometry sanitization (Repair and simplification)
* Spatial intersection
* Area calculation
* Split by property
* Stratification; special spatial intersection

## Vector tile service
![alternative text](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Vizzuality/marxan-cloud/feature/add-new-services-processing/marxan-geoprocessing-architecture.puml)

* Serve vector tiles from the db on the fly with a Redis cache upfront


### For the future:
* Raster management

## Data transformation operations


## Data calculations
### Targets

### BLM calibration


## Marxan executer

## data postprocessing
### Targets
### Solutions
