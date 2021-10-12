# Cloud platform computations

- Document created on: 27 September 2021.
- Latest updated on: 27 September 2021.

Throughout the lifecycle of a Marxan Cloud project, the platform carries out
tabular or geospatial computations at key steps.

This document summarises which kinds of computations are performed, and outlines
areas for improvement.

## Planning area

When users upload a shapefile with a custom planning area (to be later split
into a regular square or hexagonal grid of planning units), the API validates
and processes the uploaded shapefile data and returns a GeoJSON representation
of the supplied planning area.

This operation is carried out synchronously.

The time complexity of this operation depends mostly on the geometries of the
planning area.

## Planning unit grid

When users choose to use a generated planning unit grid (rather than uploading a
shapefile with a project-specific grid), planning unit geometries are generated
via PostGIS.

The time complexity of this operation is generally `O(n)`.

## Protected portion of planning units

`api/apps/geoprocessing/src/modules/scenario-protected-area-calculation/scenario-protected-area-calculation-processor.ts`

Once users create or update a scenario, choose relevant IUCN protected area
labels or upload a shapefile of protected areas, and set the threshold to be
used in order for a planning unit to be considered as protected, the protected
portion of each planning unit is calculated.

The time complexity of this operation depends on the geometries of the protected
areas included in the analysis, as well as on the number (and geometries, if
irregular/user uploaded) of planning units.

## Scenario features

Once users have selected which features they would like to include in the
analysis, either by picking them as-is or by applying split or stratification
operations, the intersection of geometries of selected features with planning
units as well as the area of each planning unit where the feature is present are
calculated.

When users add new features to the analysis, or configure different split or
stratification operations for previously selected features, only newly added
features and features whose geometries have changed (as a consequence of a split
or stratification operation) are computed anew.

Changes to settings such as `fpf` and `prop` are reflected in the configuration
of a feature for a scenario, without any geoprocessing operations being
required.

The level of isolation for computation of features is each individual scenario.

The time complexity of computations of features for a scenario depends largely
on the geometries of the features as well as on the number (and geometries, if
irregular/user uploaded) of planning units.

## Cost surface - downloading template shapefiles

When a user initiates the download of a shapefile template for a scenario's
cost surface, the shapefile is generated asynchronously.

The time complexity of this operation may vary from `O(n)` with little
geoprocessing overhead to cases where the querying of data for inclusion in the
template may be negligible compared with the geoprocessing part, for very
complex or numerous planning unit geometries.

## Cost surface - uploading cost data shapefiles

When a user uploads a shapefile that contains cost surface data for a scenario,
the shapefile is validated/processed, cost data is extracted and persisted to
database.

The time complexity of this operation should in most cases be close to `O(n)`,
with some overhead for large shapefiles.

Somewhat mitigating this, a configurable limit on the size of accepted
shapefiles is in place.

## Marxan input files

When a user initiates a new Marxan run, a separate task takes care of:

* preparing the Marxan execution
* actually running Marxan and monitoring the progress of the run
* gathering result outputs

As part of the preparation of the Marxan execution, the task will request from
the API the Marxan input files. These are currently generated on the fly each
time a Marxan run is initiated within a scenario.

### input.dat

`api/apps/api/src/modules/scenarios/input-files/input-files.service.ts`

This is a plain selection of stored settings.

Time complexity is `O(1)`.

### pu.dat

`/api/apps/api/src/modules/scenarios/input-files/cost-surface-view.service.ts`

This is a plain selection of stored tabular data.

Time complexity is `O(n)`, depending on the number of planning units.

### spec.dat

`api/apps/api/src/modules/scenarios/input-files/spec.dat.service.ts`

This is a plain selection of stored tabular data, with some aggregation.

Time complexity is `O(n)`, depending on the number of features and how these are
broken down in raw data in subsets grouped by identical attributes.

### bound.dat

`api/apps/api/src/modules/scenarios/input-files/bound.dat.service.ts`

Data for this input file is computed via geospatial processing of planning unit
geometries, pairwise.

Time complexity is essentially `O(n)`, depending on the number of adjacent
planning unit pairs, and on the geometries of planning units.

#### Possible optimizations

Since the planning unit grid is defined at the project level and will never
change throughout the lifecycle of a Marxan Cloud project, boundary length data
can be computed once and reused every time a `bound.dat` file for any of the
project's scenarios is requested.

For practical reasons, given how this data is currently calculated and with the
aim of keeping changes to a minimum within the initial project development
phase, it would be advisable to still generate `bound.dat` when a scenario is
run, caching it for any successive runs of the same scenario.

### puvspr.dat

`api/apps/api/src/modules/scenarios/input-files/puvspr.dat.service.ts`

Data for this input file is computed via geospatial processing of feature and
planning unit geometries.

Once a feature is defined (via copy, split or stratification) and added to a
scenario, the `puvspr.dat` rows linked to the feature (one per planning unit
that intersect the feature) will not change, except for settings such as `fpf`
and `prop` which do not depend on geospatial data.

Time complexity depends on the number of features by planning units that each
feature intersects, and on the geometries of features and planning units.

#### Possible optimizations

Currently the whole set of features configured for a scenario is processed at
once, irrespective of whether the geometries of any features have changed or
whether any features have been added besides ones selected in a previous run of
a scenario.

This could be improved by:

- breaking down *by feature* the calculation of `[species, pu, amount]` tuple
  data for each feature, iterating over each feature
- caching (in Redis) the tuple data, once calculated
- only calculating the relevant tuples for newly added features (vs a previous
  Marxan run)
- compiling the `puvspr.dat` file for each scenario by retrieving and
  concatenaging the cached values, while calculating cache misses

The level of isolation for computation of features vs planning unit data is each
individual scenario.
