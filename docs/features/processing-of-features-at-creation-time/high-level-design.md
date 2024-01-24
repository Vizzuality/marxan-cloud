# Processing of features at creation time - High level design

Updating the way features are processed will involve these broad steps:

- Enable the ability to store feature amounts per PU independently of
  `(geodb)features_data`, for all the kinds of features

  - Shift to using the `(geodb)feature_pu_amounts` table consistently (so far
    named `(geodb)features_calculations` and only used to cache calculations for
    features imported from shapefiles)

  - Replace all existing uses of `(geodb)features_data.amount` (generation of
    `puvspr.dat` input files for the Marxan solver, MVTs, etc.) with
    `(geodb)feature_pu_amounts` instead

  - Update how `features_data` is stored for features from legacy projects and
    features imported from puvspr CSV data: store these as a single row of
    geometries in `(geodb)features_data` instead of creating one row per
    planning unit

  - Update all project piece exporters and importers accordingly

- Implement calculation and storage of feature amounts per planning unit at
  feature import/creation time _for features from shapefiles_

  - Move existing calculation of area from the step of processing feature
    specifications to import time

  - Shift to processing import of feature shapefiles _asynchronously_ (API and
    app)

  - Use async job API events to handle progress, success and failure of import
    and calculation of each feature

  - Complete the full transition to `(geodb)feature_pu_amounts` by extending
    the use of this to features imported from shapefiles

- Enable to handle split features as full features

  - Move splitting of features out of the workflow for processing feature
    specifications, making it a first-class project-level asynchronous operation
    instead (accessible via the inventory panel at project level)

  - Tidy up the leftover operations in the processing of feature specifications,
    keeping it for processing of tabular data only (`prop` and `fpf`)

- Generate planning grid MVT tiles that include feature amounts per planning
  unit from `(geodb)feature_pu_amounts` data, for all the kinds of features

- Re-import World Terrestrial Ecosystems species data as a pre-split set of
  individual ecosystem features

  - This involves retrofitting existing projects to use pre-split features,
    if applicable - including for exported data (if realistically achievable)

- Enable users to include pre-split platform-wide features in their projects


  - Pre-calculate amounts per planning unit for pre-split platform-wide features
    and store these in `(geodb)feature_pu_amounts` as for any other feature

  - Allow users to list platform-wide features and pick them for use in their
    projects, as shallow copies
    
    - These are now first-class project features, but without duplicating the
      underlying spatial data from the platform-wide features they are derived
      from
    
    - Amounts are copied over from the platform-wide origin feature, making the
      project-specific clone fully "self-sufficient" in terms of data

- Enable to handle gap data in a unified way across all types of features (from
  shapefile, from legacy, from puvspr data)

  - Consolidate how gap data is calculated and reported to users, for all of the
    feature import paths available
