# Uploading legacy Marxan projects - High-level design

Importing legacy projects requires several steps, outlined below.

## Workflow overview

From an API consumer point of view, importing a legacy project happens through
three main steps and related endpoints.

### Preparation of project import process

`POST /api/v1/projects/import/legacy`

This step will prepare an empty project shell, as well as an empty scenario
shell, both of which will be populated later in the import process, unless
errors are raised while validating the user-uploaded data.

The `projectId` of the project being created will be returned, so that the next
steps can reference the project.

### Data upload

`POST /api/v1/projects/import/legacy/:projectId/data-file`

API clients will need to use this endpoint to upload each of the files that
users provide.

Each upload will include the actual file alongside a small JSON metadata snippet
through which the API is informed about which kind of file this is, alongside
any other metadata needed to import it.

As API clients send requests to this endpoint, the API keeps the uploaded files
in a temporary storage area, from which they will be later read and processed.

### Data validation and import

`POST /api/v1/projects/import/legacy/:projectId`

This endpoint will validate if all the required files have been uploaded,
return an error if not, or initiate the actual processing of the data to import.

Warnings or errors encountered during the validation phase of each piece
importer will be available via a dedicated endpoint: `GET
/api/v1/projects/import/legacy/:projectId/validation-results`.

Status of the import process will be available, like any other project- or
scenario-related status, via `GET /api/v1/projects/:projectId/status`.

As an example, API clients may decide to request validation results if the
project import process terminates with a failure, as reported by polling the
status endpoint.

## Workflow details

### Preparation of project import process

- Users request to initiate a legacy project import, and provide basic project
  data:

  - project name
  - project description (optional)

- A shell of project should be created (this allows to have an id and to fire
  events as needed, and also to set things up for eventual cleanup).

- Project source (see section _Changes needed to existing platform features_
  below) should be set to `legacy_import`.

- A legacy project import start event (API event) should be emitted. This will
  signal that the project is not usable yet and it should not be included in
  lists of projects, displayed or edited in any way until the import process has
  completed successfully.

- The initial project owner should be set to the user performing the upload.

- A single new scenario shell should be created within the project shell, with
  the same name as the project name supplied by the user on upload.

### Data upload

Users will need to upload required files, and they will have the option to
upload optional files:

  - planning grid shapefile (as zip file, identical to any other shapefile in
    the platform)
  - `input.dat`
  - `pu.dat`
  - `spec.dat`
  - `puvspr.dat`
  - optionally, output files, as a single zip file with the whole contents of a
    Marxan `output` folder; not all these files will be needed/used, but they
    can be allowed in the import and discarded if not used
  - if users upload output files, they should be given the option to specify via
    a boolean flag whether the Marxan should be allowed to run (if not,
    historical imported solutions will be considered "final" as an archived
    representation of planning done outside of the Marxan Cloud platform)
  - optionally, one shapefile for each feature (a zip file for each of these)
  - optionally, a cost surface shapefile (a zip file)

- Uploaded content should be stored in a temporary import folder linked to the
  `projectId` of the project being imported, within the storage folder allocated
  to project cloning (`/opt/marxan-project-cloning`).

### Data validation and import

Project components will be validated and imported through piece importers (and
associated validators). As for importing and cloning of native MarxanCloud
projects, these piece importers may run in batches, with batches being scheduled
according to data dependencies.

A failure (validation error or other kind of expected or unexpected failure)
within a piece importer will cause processing of the whole import process to
halt with failure _once all the pieces of the current batch have finished
processing, either with success or failure_. A failure event should then be
emitted, and API clients can use the validation results endpoint (see initial
section) to retrieve a list of errors that led to the import failure.

All validations for input files are expected to be done according to the
settings and column types and allowed values documented in the _[Marxan Manual,
2021
edition](https://marxansolutions.org/wp-content/uploads/2021/02/Marxan-User-Manual_2021.pdf)_.

Validation is carried out asynchronously, using events linked to the id of the
project shell to report on status.

All validation errors and warnings should be collected and reported back to
the API consumer as a single document gathering all the errors and warnings,
through a dedicated API endpoint.

  - Planning grid

    - Should be validated like any other shapefile (required components, size,
      etc.)

    - Each distinct geometry should have a `puid` attribute in the attribute
      table, and this needs to be an integer number, zero or positive

  - `input.dat`

    - All values in the _General Parameter_, _Annealing Parameters_, _Cost
      Threshold_ and _Program Control_ setting groups (see Manual section _5.3.1
      The Input Parameter File (input.dat)_) should be validated to be of the
      correct type

    - Additionally, `BLM` and `NUMREPS` should be validated for their value as
      for existing validations (for `BLM`) and for consistency (`NUMREPS` should
      have a sensible upper bound)

  - `pu.dat`

    - All the `puid` values in the planning grid shapefile should have a
      corresponding row in this file (`id` column values must match the `puid`
      values in the shapefile's attribute table) and not be duplicated; rows
      with `id`s that don't match any geometry in the shapefile should be
      reported as validation warnings only.

    - Validation according to section 5.3.3 of the Marxan Manual for `cost` and
      `status`; `xloc` and `yloc` should be ignored.

  - `spec.dat`

    - Validation according to section 5.3.2 of the Marxan Manual.
    
    - Only `prop` is supported: if `target` is set for any of the rows, an error
      should be reported to API consumers, advising to repeat the upload after
      translating `target` to `prop`.
    
    - The `name` property should be enforced as compulsory (it is not compulsory
      per se according to the Marxan manual, but it will be needed in order to
      set feature names further on during the import process).

  - `puvspr.dat`

    - Validation according to section 5.3.4 of the Marxan Manual.

    - `amount` is assumed to be extent of the feature within the PU in the
      EPSG:3410 SRID units

  - Output files

    - Validation according to section 7 of the Marxan Manual.

    - For a first iteration of the import functionality, these files may be
      assumed to be substantially valid; handling possible user tampering of
      these files would be a complex task way beyond the scope of an initial
      implementation.

  - Shapefiles for features (if provided)

    - Validation as other shapefiles

    - Users will provide a numeric id for each shapefile: this needs to match
      the `id` of one of the `spec.dat` rows

  - Cost surface shapefile (if provided)

    - Validation as other shapefiles

### When initial validation fails

If any errors are gathered through the validation step, the import process
should fail, the project should be marked as incomplete (and the only action
allowed on it should be the deletion of the project itself), and all the
temporary uploaded data should be deleted (honouring the feature flag that
allows to keep temporary files on the filesystem); users should be able to see
the list of errors gathered through the validation step (via the validation
results endpoint for the project).

### Importing data

If the validation step was successful, any warnings gathered through it should
be available to users via the status endpoint for the shell project, as part
of the "legacy project import validation completed" event.

Data can now be imported.

- Planning grid should be set from the grid shapefile.

- Initial cost surface should be set from `pu.dat`.

- PU lock status should be set from `pu.dat`. If any unexpected values are found
  in the `status` column of `pu.dat`, this will trigger a db error and this
  should cause the import to fail, with an error message pushed to the list of
  errors to inform the user.

- Project features should be created:

  - either from the uploaded shapefiles for features (if supplied), or
  - via a spatial join between `puvspr.dat` and the planning grid: in practice,
    this should lead to a single geometry per feature (that is, one
    `(geodb)features_data` row) which is the spatial union of all the planning
    units listed for the given feature in `puvspr.dat` (but see note below about
    manually setting the feature `amount` per planning unit in order to preserve
    the value provided on input via `puvspr.dat`). The name of the feature
    (`(apidb)features.feature_class_name`) should be set from `spec.dat`

All the following import steps are for this only scenario created on import.

- Lock status of planning units for the scenario should be set from `pu.dat`.

- A feature specification should be created, including all the features imported
  (and listed in `spec.dat`), setting their `fpf` and `prop` values from the
  uploaded `spec.dat` file; the feature specification should be then processed
  in order to get all the required `(geodb)scenario_features_data` rows set as
  required.

- Once `(geodb)scenario_features_data` rows have been created by processing the
  specification, the `amount` value for each feature (from the uploaded
  `puvspr.dat`) should be persisted in a new column of this same table
  (`(geodb)scenario_features_data.amount_from_legacy_project`)).

- If provided, solutions should be inserted in the relevant tables, marking best
  solutions as appropriate, alongside all the relevant data.

## Changes needed to existing platform features

- New db and TS enum: `(apidb)project_sources: ['marxan_cloud',
  'legacy_import']`.
- New column: `(apidb)projects.sources project_sources not null default
  'marxan_cloud'`.
- New column: `(geodb)scenario_features_data.amount_from_legacy_project`.
- New column: `(apidb)scenarios.solutions_are_locked boolean not null default
  false`.
- The main query in
  `api/apps/api/src/modules/scenarios/input-files/puvspr.dat.service.ts` should
  use this new field, `if not null`, instead of the calculation via intersection
  (`ST_Area(ST_Transform(st_intersection(species.the_geom, pu.the_geom),3410))`)
  that is normally carried out.
- When processing a request to run Marxan, reject the request if
  `(apidb)scenarios.solutions_are_locked is true`.
