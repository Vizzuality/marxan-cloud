# Goal

Users may sometimes create their own planning unit geometries, instead of
relying on generated square or hexagonal grids, for a variety of conservation
reasons, so they should be able to supply their own PU grid via a shapefile
upload.

# Key assumptions

* once set, shape cannot be changed or removed from project
* only `FeatureCollection` with `Polygon` features can be uploaded
* custom planning unit grid geometry belongs to given project
* custom planning unit grid geometry has a type of `irregular`
* project with custom planning unit grid geometry cannot use other shape types
* uploaded shapefile will be processed asynchronously
* until processed, any action on project/underlying scenarios shouldn't be
  allowed
