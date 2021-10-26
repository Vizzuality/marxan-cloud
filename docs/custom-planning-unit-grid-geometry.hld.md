# Goal

Users may sometimes create their own planning unit geometries, instead of
relying on generated square or hexagonal grids, for a variety of conservation
reasons, so they should be able to supply their own PU grid via a shapefile
upload.

# Key assumptions

* only `FeatureCollection` with `Polygon` features can be uploaded
* no intersection between polygons and each polygon should "touch" at least 
  one of other polygons
  * shapefiles cannot be fully processed if they do not comply with the 
    conditions above, and possibly other conditions to be identified before 
    implementation
  * conditions that may not be expediently validated should be clearly documented (as part of user documentation)
  * as per async-job nature and potentially heavy computations, validations 
    shall be conducted within async processor
* custom planning unit grid geometry belongs to given project
* custom planning unit grid geometry has a type of `from_shapefile`
* project with custom planning unit grid geometry cannot use other shape types
* uploading shapefile will return GeoJSON and planningAreaId
* until project is created, shapefile has no direct relation to project
* planning area should be derived from grid shape
* project's bbox should be derived from grid shape (or derived planning area)

# API specific

* "temporary" planning area and corresponding planning units geometries are 
  linked to "fake" project of the very planningAreaId itself; this allows to 
  "switch" to real project once it is created - this approach lowers the 
  amount of changes needed
