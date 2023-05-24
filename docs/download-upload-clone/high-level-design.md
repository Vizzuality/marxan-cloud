# High Level Design

* exporting a project exports its underlying scenarios
* as the client agreed, pre-defined resources do not need to be described 
  with unique identifier shared across possible instances of MarxanCloud 
  (Databases) - if any shared resource with imported ID is not available, 
  import should be rejected
* each of the resource above should consider if it is allowed to be used 
  (license issues). In case it cannot be used during export, system should ..
  take under consideration
* existing data converted from shapefiles should be converted back to 
  shapefile format (currently the platform doesn't keep the uploaded files, 
  rather consumes them)
* each export is a zip file
* each export includes information about its current version
  * in particular, it may also include what was exported, when, by whom etc...
* each export includes information about dataset version (protected areas, 
  features...)
  * when importing an archive, system should ensure that given instance uses 
	the very same dataset version
* components included in the exported files:
  * Project:
    * Project metadata (name, etc.)
    * Project planning area (GADM), if provided
    * Project planning area (from shapefile), if provided
    * Project planning grid config (shape + unit area) and actual unit geometries, if generated
    * Project planning grid (from shapefile), if provided
  * Each scenario:
    * Scenario metadata (name, etc.)
    * IUCN categories for protected areas (note: if src and dest instances differ, and they use different WDPA versions, resulting protected area set may be different)
    * Protected area geometries from shapefile
    * Threshold for protected areas
    * Features geometries for any user-supplied ones
    * Feature specification (dependency on platform-wide features)
    * Cost data per planning unit
    * Lock status (default, available, locked-in, locked-out)
    * Marxan settings (iterations, BLM, all advanced settings - input.dat in 
      general)
    * scenario run results (with option to not export or import them)
* when declaring file to import, system should accept the options to:
  * run scenarios with settings as per normal run once import is finished, 
    as long as the solutions are not included in the imported file 
* export operation is asynchronous, should block the usage of project/scenarios
* if there is any job in progress for the project/scenarios, export 
  shouldn't be allowed
* import operation is asynchronous
* if import of the project (or its underlying scenarios) is ongoing, no 
  action on given project should be 
  possible to take by the user
* if import of the scenario is ongoing, no action on given scenario should 
  be possible
* keep in mind that feature should be flexible enough to have reusable 
  pieces which can be used for "cloning" without a need to generate archive
* public project can be exported/cloned as well.

# To be declared 

Things that still need some spike/analysis/decision. As they may not be 
straightforward, we should consider writing down all pros/cons of all 
possible solutions that team can come up with, finally making a decision and 
describing why given solution was picked (and others were discarded).

* existing shapes/data that came from `shapefile` - should it be converted 
  "back" by the system, or should be store the original uploaded 
  `shapefiles` and keep their reference?
* exported zip format/shape
* exported zip storage location (s3-like)
* set the policy of licensed resources
