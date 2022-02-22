# Scenario editing workflow - brief

This document describes the scenario editing workflow as redesigned in December
2021 to meet the requirement of allowing users to quickly refine a Marxan
scenario by editing key traits and re-running Marxan without having to switch
between a "view mode" and an "edit mode" as initially implemented.

As part of this redesign, scenario editing tabs have been reorganized, by
grouping all the actions related to the configuration of the study area first,
followed by configuration of features. Before running Marxan users have the
option to hand-tune advanced settings (for `input.dat`) and to calibrate the
BLM.

## Actions by tab

* Planning units
  * Protected areas (from IUCN categories for WDPA areas or from custom
    shapefiles)
  * Adjusting planning units (lock status)
  * Cost surface
* Features
  * Selection, Split, Stratification
  * Setting `prop` and `fpf`
  * Gap analysis (informational only)
* Parameters
  * Advanced Marxan settings for `input.dat`
  * BLM Calibration -> setting BLM value
* Solutions (as in original design)

## Workflow

While users are creating a scenario, or editing a previously created scenario
after having run Marxan on it, they can edit any aspect of the scenario within
the tabs listed above. Due to dependencies between some of the settings (for
example, selection of protected areas affecting default lock status of planning
units, and in turn affecting the solutions proposed by the Marxan solver), some
changes may invalidate others or require to rerun geoprocessing operations.

In these cases, the frontend app will inform users about actions needed (such as
recalculations that may need to be triggered), or displayed data or maps that
may be out of date.

The intent is to provide a way for users to quickly edit parts of a scenario,
while retaining the option of only running computationally expensive
calculations only when needed.

## Designs

* [Interactive prototype from Dashboard](https://www.figma.com/proto/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?page-id=6694%3A10654&node-id=6694%3A11392&viewport=333%2C48%2C0.53&scaling=min-zoom&starting-point-node-id=6694%3A11392&show-proto-sidebar=1)
* [Interactive prototype from Project Dashboard (before setting parameters and Run)](https://www.figma.com/proto/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?page-id=6694%3A10654&node-id=6727%3A12685&viewport=333%2C48%2C0.53&scaling=min-zoom&starting-point-node-id=6727%3A12685&show-proto-sidebar=1)
* [Interactive prototype of editing](https://www.figma.com/proto/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?page-id=6694%3A10654&node-id=6837%3A18442&viewport=333%2C48%2C0.53&scaling=min-zoom&starting-point-node-id=6837%3A18442&show-proto-sidebar=1)

## Invalidating information

(work in progress, from https://docs.google.com/document/d/18lIqOVrn5QXE4QuAaqrTLndQa0-q8tmkyrQJfGlLu-8/edit)

### When a user makes any changes that require any kind of recalculation(s) before running Marxan again

E.g: A change on the Protected Areas section will require recalculations of the
features before re-running Marxan.

* Interface shows:
  * Red dots in all the tabs outdated that needs to be recomputed.
  * A disclaimer + button saying: “Your information and solutions are outdated” <Recalculate>
* When user clicks recalculate, the system runs all the needed calculations.
  System should detect all the calculations needed, and run them)
  * User could directly re-run Marxan, in this case, the system will re-do all the calculations needed. 
* When calculations are done:
  * all the red dots disappear but the one on solutions.
  * generic disclaimer + button disappear
* User can make more changes or go to “solutions” tab
* When finally on solution tab, user clicks re-run Marxan
* System run Marxan
* All disclaimers and red dots disappear.

### When a user makes a change that while causing some information to be outdated, does not require recalculations

Eg: a change on the Protected Areas section will invalidate the BLM calibration
but is not really needed to re-run that calibration, just letting the user know
that part is outdated.

* Interface shows:
  * Orange dots in all the tabs that contain outdated information.
  * Inside each tab: A warning explaining what is going on. 
* When the user updates the information (for example by running a BLM
  calibration afresh), warnings disappear. 

## Application support

In order to reliably support this scenario editing workflow:

* the API should keep track of which parts of the scenario are up to date and
  which are not
* it should provide this information to the frontend app, on request, so that
  appropriate warnings and calls to action may be displayed
* it should prevent actions from being carried out on stale data
* the frontend app should display data staleness warnings with relevant
  importance color-coding (see previous section) and calls to action:
  * required: recalculate scenario, re-run Marxan
  * informational: refresh gap analysis, re-run BLM calibration

## Data dependencies

The graph below maps the dependencies between data inputs and outputs (which are
often in turn inputs to further processing steps).

![Data dependencies graph](./marxan-data-dependencies.png)

(See `data/notebooks/Lab/data-dependencies.ipynb` in this repository for
source data for this graph)
