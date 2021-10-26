# BLM Calibration - High-level design

Reference to latest (draft) designs:
https://invis.io/G211WEUZFST9#/459986030_Marxan_09a

* BLM calibration can be run *on a scenario*.
* Running a BLM calibration process should block editing or even running a
  scenario: whereas the outcomes of BLM calibration are informative only (i.e.
  they don't affect the outcomes of a Marxan run), they do however depend on a
  specific configuration of a scenario as input, so any changes to a scenario
  may make results of a previous or still-running BLM calibration process stale
* It may however be desirable from a UX perspective to inform the user that a
  BLM calibration process is running for a given scenario; this may be used both
  to visually inform the user about the running process (frontend app) and
  possibly to cancel a current calibration process (force-starting a new one
  will need a currently-running one to be cancelled)
* The Marxan solver must be run N (6) times, each time for 10 iterations and
  with one of the N BLM values provided by default in the BLM calibration
  screen, or set there by the user
* It may be desirable to set number of runs N as a config default; this number
  is not expected to change once confirmed, and doing so would have implications
  for the frontend, but it would help to make it a configurable setting at least
  to avoid hardcoding assumptions in the code about the number of runs
* A set of initial recommended BLM values should be calculated *at project
  creation stage* as this depends on the PU size, which will be known once the
  PU grid is set.
* This could be read via an ad-hoc endpoint, or by including this information in
  the project result DTO; probably the former would be preferrable, to avoid
  overloading the project result DTO
* `POST` endpoint to request a calibration task with specific BLM values (either
  the initial recommended ones, or those set by users)
* User-set values should also be persisted and associated to a scenario: once
  the BLM calibration process has finished the values will also be inferrable
  from the results, but until then there must be a way for the frontend to
  request the latest set values in order to render things even while calibration
  results are pending
* For performance reasons, input .dat file generation should be refactored at
  this stage to use precalculated data (i.e. no on-the-fly geo calculations for
  `pu.dat`, `puvspr.dat`, `bound.dat`, etc. - see
  `docs/marxan/data-computations.md` in
  https://github.com/Vizzuality/marxan-cloud/pull/541); the current approach
  would compound by the number of calibration runs the already very high
  overhead to marxan runs due to the initial generation of these files instead
  of resorting to precalculated data. Alternatively, to avoid extensive
  refactoring while implementing BLM calibration, the BLM calibration processor
  should only request input .dat files once (rather than for each of the six
  runs it will orchestrate).
* Status of BLM calibration should be exposed via the existing scenario status
  data (this could be either just started/finished/failed, or M total iterations
  completed of N*10 to be scheduled).

Two main options for running Marxan N times:

* keep as much as possible of the `MarxanSandboxRunnerService` framework
  * a BLM calibration process would then be equivalent to running Marxan N times
  * some assumptions will need to be made configurable
  * for example, run results should not be persisted to the same db tables as
    "real" runs to avoid mixing up actual run results with BLM calibration run
    results; this could be handled somewhat by tagging each set with their
    origin (BLM calibration or actual scenario run) and deleting data from
    previous runs in a transaction together with persisting results from the
    latest run, but this may end up being brittle, especially until a stable
    workflow is in place to allow to handle multiple run results for the same
    scenario, garbage-collect stale results data, etc.
* create an ad-hoc, minimal `MarxanSandboxBlmCalibrationRunnerService` focused
  on the task at hand:
  * possibly no need to allow users to cancel the N calibration runs: the BLM
    calibration runner should be fast at least for the overhead parts before and
    after actually running the solver
  * however, at least to avoid having to deal with stale failed runs, it may be
    desirable to start a new calibration process by cancelling a previous one
    (which may still be running or have failed)
  * Marxan could be run N times for 10 iterations in the same workspace, by
    creating N input.dat files that differ only by the `BLM` parameter's value,
    and parsing/saving the results of each run (only cost of the best solution)
  * The Marxan workspace may be set up as N identical clones (except for the
    `input.dat` files, each with a unique `BLM` value) or as a single workspace
    (in which case runs can only happen sequentially)
  * Runs could either be started sequentially (possibly cleaning and reusing the
    `output` folder) or in parallel (this will need the setup of N workspace
    clones, as above)
    * complex Marxan runs may use up significant CPU resources for some time,
      even taking into account the limited number of iterations, so any
      concurrency setting should be carefully considered (e.g. maximum two runs
      concurrently)
    * overall, a sequential setup may be simpler to manage while not
      significantly impacting run times (a future setup using Kubernetes
      workers, if desirable, may allow to run BLM calibration runs faster by
      letting the Kubernetes scheduler scale resources as needed)
    * jobs for BLM calculation runs should be handled through their own queue,
      in order not to affect jobs queued for full runs
    * `SolutionsOutputService` only needs to parse output for best solution and
      its cost, as well as PU selection for the best result: no need to zip
      input and output files, persist individual result rows, etc.

Either way, it may make sense to refactor the current Marxan worker to allow
this to coexist with a BLM calibration worker without having to
diverge/duplicate too much code:

- creating a `RunWorker` for calibration runs specifically
- letting `MarxanSandboxRunnerService` be constructed by a factory, so that
  relevant parts could be created by it (and thus replacing
  `SolutionsOutputService` within the factory)
- scheduling a first "asset fetcher" job that fetches input `.dat` files and
  prepares the workspace, before any of the 6 calibration runs can start
- executing `N` jobs per calibration process (with `N = number of calibration
  values`), to allow them to run in parallel
- possibly creating `CalibrationRunsMetadata`-like entity, which holds the
  results from all runs
- (api?) when each job in a set of 6 for a calibration process finishes
  successfully, listen to queue events and emit relevant CQRS command so that a
  handler can mark the run as done (with write lock?); once all 6 runs are done,
  emit final event to signal that the whole calibration process has finished (or
  failed, if any of its runs have failed).

Once the N calibration runs have finished:

* Previous calibration results for the scenario, if they exist, should be
  discarded
* An array of `{ blm: number, score: number, boundaryLength: number }` results
  should be persisted for the scenario (one for each of the N input BLM values)
* These results should be made available either via an ad-hoc `GET` endpoint,
  or added to the `ScenarioResult` DTO.
* An array of sets of selected PU ids should be persisted for the scenario (one
  for each of the N input BLM values)
* This data will then be used to generate MVTs for the thumbnails of solutions
  shown for each BLM value (cfr design): data-wise, these MVT tiles would carry
  similar information as the tiles used when displaying scenario run results:
  for full Marxan runs, MVTs state - for each planning unit - which iteration of
  the run did include that planning unit in the solution; for BLM calibration
  tiles, each PU would instead carry the BLM value for which the best solution
  did include that planning unit
* Workspace should be cleaned up, as with full Marxan runs (also in case of
  failure)

