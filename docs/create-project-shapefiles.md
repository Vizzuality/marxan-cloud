# Current approach of handling shapefiles

## Custom planning area

Frontend sends Shapefile which is persisted in geo database and its ID and 
GeoJSON is returned to make it being displayed on map by frontend (not using 
tiles)

Then, when submitting whole creation, given ID is used.

There is some simple mechanism that collects unused persisted planning areas.

## Custom feature

Frontend sends Shapefile which is persisted in geo database and attached to 
scenario (without explicit marking it as used). Neither ID nor GeoJSON is 
returned.

## Protected area

Frontend sends Shapefile which is persisted in geo database and attached to 
project (without explicit marking it as used). Neither ID nor GeoJSON is
returned.

## Cost surface

Frontend sends Shapefile which is persisted and processed - values are 
attached to scenario. Nothing is returned.

# Possible approaches of creating a project

## Full payload

Approach similar to `Custom planning area` should be used whether it is a 
planning area or grid upload.

Pros:
- using similar flow for creating, as per custom planning area
- keeping "everything" as required - clear statement what is needed
- mostly implemented logic on frontend

Cons:
- keeping "everything" as required - may be hard to maintain the more steps 
  come, cannot edit them step by step
- a need to display custom, returned GeoJSON manually on frontend instead 
  using map tiles (although already implemented)
- keeping different approaches of how uploading shapefile works in different 
  parts of the system
- requires some further adjustments on backend
- requires to keep API's to proxy request to Geoprocessing

## Step by step payload

First standalone project is created (given name and description), then any 
further modification can be applied for given project directly.

Pros:
- unification of how shapefiles are processed
- easier to understand for "newcomers"
- splitting to step-by-step may allow to edit any steps before creating a 
  scenario or work on them iteratively
- step-by-step may be configured in future to enable/disable some steps 
  dynamically based on instance/organization
- separated parts may simplify codebase logics (single responsibility principle)

Cons:
- need changes on frontend
- need changes on backend

