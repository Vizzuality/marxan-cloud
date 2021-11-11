# BLM Calibration - development plan

Release breakdown is tentative right now. It may be possible to keep the backend
implementation to a small number of releases, but the specific breakdown will
depend on choices such as whether to adapt and reuse
`MarxanSandboxRunnerService` vs creating a minimal ad-hoc workflow.

## Release 1

* Workspace setup for BLM calibration runs: fetch input `.dat` files only once
  per set of runs to be scheduled for the calibration process.
* API interface (endpoint and payload DTO) to accept a BLM calibration request;
  this also needs to persist the set of BLM values chosen (even if they are
  the initial recommended ones)
* Add latest BLM values for calibration to the scenario DTO
* API events to handle start/finish/failure events of a BLM calibration process
* Add initial recommended values to scenario DTO; these could be hardcoded
  at this stage, or only provided for regular generated grids (as the PU area is
  known in this case) while defaulting to a range of default values without PU
  area multiplier for custom grids (see [Brief](./brief.md) document, ignoring
  the formula part that refers to PU area)

## Release 2

* `MarxanSandboxBlmCalibrationRunnerService` (if opting to create an ad-hoc
  runner), or adaptation of `MarxanSandboxRunnerService` (if opting to reuse as
  much as possible of the workflow for full runs)
* BLM calibration-specific `SolutionsOutputService`: this only needs to persist
  cost and BLM value for each calibration run for a scenario, as well PU
  selection (which PUs are included in the best solution)
* Cancellation of a previous calibration process if still running, or
  force-cleanup if failed

## Release 3

* BLM calibration status data in scenario status data
* GET endpoint for BLM calibration results for a scenario (pairs of `{ blm:
  number, score: number; boundaryLength: number }` values). Maybe the shell
  interface could be created as part of Release 1 to allow frontend to prepare
  things.
* Tile endpoint (new or adapted) to render MVT tiles of the best solution for
  each BLM value; as this endpoint will use persisted PU selection for each BLM
  value the performance overhead should be acceptable compared to storing a
  plain image of each solution map, without the overhead of a different code
  path to generate, store and invalidate static images. Maybe the shell
  interface could be created as part of Release 1 to allow frontend to prepare
  things.
