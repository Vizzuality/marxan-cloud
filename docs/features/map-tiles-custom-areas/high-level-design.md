# Map tiles for custom planning areas and custom grids - High-level design

This document aims at providing an overview of the architecture of the tiles to fulfill the [requirements document](./requirements.md) for the Marxan platform.

The tiles needed to render all the kinds of areas reviewed in this document will be of two kinds:

preview: these are used when a user is configuring planning area and grid for a project, before the project is actually created in the system (hence, we won't have a project_id available at this stage, nor will any spatial data have been linked to a project yet, even though it will have been stored in the geodb
for scenario: these are used when project-level planning area and grid data is shown while creating or editing a scenario; at this stage the relevant spatial data will have been linked to the scenario's parent project


## Preview custom planning area tiler

In order to generate the vector tiles for the custom planning area, we need to access to the `planning_areas` table in the marxan geoprocessing database. For visualization purposes, we only need to access to the `the_geom` column.

The tiler system will follow a similar implementation as the other tiler systems within this project. In the geoprocessing service a custom query will be used to access the `the_geom` column of the `planning_areas` table and to generate the tiles.
The data upload jobs should provide back the id of the planning area id. this information should be use to query the `the_geom` column of the `planning_areas` table. This will then be served to the user as a proxy of the mvt tile in the api service.

## Preview custom planning grid tiler

In order to generate the vector tiles for the custom planning grid, we need to access to the `planning_units_geom` table in the marxan geoprocessing database. For visualization purposes, we only need to access to the `the_geom` column.

The tiler system will follow a similar implementation as the other tiler systems within this project. In the geoprocessing service a custom query will be used to access the `the_geom` column of the `planning_units_geom` table and to generate the tiles.
The data upload jobs should provide back the id of the planning area id, by default `project_id` column in the `planning_units_geom` will be populated with the id of the **custom uploaded planning area**. this information should be use to query the `the_geom` column of the `planning_units_geom` table. This will then be served to the user as a proxy of the mvt tile in the api service.

## Project planning area tiler

In order to generate the vector tiles for the custom planning area, we need to access to the `planning_areas` table in the marxan geoprocessing database. For visualization purposes, we only need to access to the `the_geom` column.

The tiler system will follow a similar implementation as the other tiler systems within this project. In the geoprocessing service a custom query will be used to access the `the_geom` column of the `planning_areas` table and to generate the tiles.
The data upload jobs should provide back the id of the planning area id. this information should be use to query the `the_geom` column of the `planning_areas` table. This will then be served to the user as a proxy of the mvt tile in the api service.

## Project planning area tiler and Project planning grid tiler

Project planning area tiler will be similar to its preview but accessing by project id.
Project planning grid tiler needs to access to the grid independently if it has been custom upload or regular grid. In order to do so we need to filter based on the `project_id` column or for now provided the preview regular grid based on area Bbox and shape and size.


## Implementation details

GET `api/v1/project/planning-area/{id}/preview/tiles/{z}/{x}/{y}.mvt`
GET `api/v1/project/planning-area/{id}/grid/preview/tiles/{z}/{x}/{y}.mvt`
GET `api/v1/project/{id}/planning-area/tiles/{z}/{x}/{y}.mvt`
GET `api/v1/project/{id}/grid/tiles/{z}/{x}/{y}.mvt`
