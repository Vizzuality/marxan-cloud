# BLM Calibration - high-level design

This document describes the current high-level overview of the Marxan Cloud
platform user features related to calibration of the BLM (boundary length
modifier) for a Marxan scenario.

## Aim

The BLM value chosen for a Marxan analysis can greatly affect the spatial
distribution/clumping of planning units selected by the solver.

The BLM calibration process designed for the Marxan Cloud platform will allow
users to have an “at a glance” overview of the spatial distribution of
solutions, given a discrete set of BLM values.

The overview is presented to the user via a thumbnail snapshot of the solutions
for each BLM value being tested, alongside the cost of solutions for each of
them.

Once the calibration results are presented to the user, they may then choose to:

- Select one of the calibrated BLM values, to implement in the scenario (this
  will set the BLM property for the scenario)
- Change one or more 6 values of the previous calibration run, and re-run the
  calibration
- Input their own BLM value (without using the platform's calibration feature)

## Overview of the process

For an overview of the process, see `data/notebooks/Lab/marxan_blm.ipynb`.

The gist: this is done by running the Marxan solver on the same input files that
would be used for the actual user-triggered Marxan run, once per BLM value in
the given range, with a limited number of iterations per run (10) and only
varying the BLM value in the input.dat file, all the rest being kept equal
across each of the runs.

## Requirements

- Users should be able to set their BLM values.

The set should be limited to a small cardinality: 6 values for the initial
implementation, but leaving space for adjustments in the future (i.e. it is ok
to hardcode the size of the set, but changing it in the future should not break
other assumptions).

- The 6 values given by default will be `BLM = Z*sqrt(PU area)` (with `Z`  being
  `0.001`, `0.01`, `0.1`, `1`, `10` and `100`).
  
This will apply for the majority of projects, which are expected to use a
constant PU area. Some projects may use irregularly-shaped planning units with
varying area: in this case the mean of the areas of the planning units in the
study area should be used [*], with option to further tune this in the future (as
above, it is ok to hardcode this, as long as using a different aggregation
formula that doesn't depend on other inputs than PU area and PU count will not
break other assumptions).

[*] Pending confirmation.

- Thumbnails of each run’s solutions displayed alongside the curve for visual
  inspection.

- No need to do curve fitting and elbow search.

- No recommended value (as corollary of the above).

- A line chart will be shown to users, but it will reflect the actual values
  (being or not a curve).

For reference, the initial functional design involved:

- Using a *fixed* set of BLM values (6 of them), to be used for every
  project/scenario.

- Curve fitting across the resulting scores.

- Optimal value selected as the “elbow” of the curve (see Marxan manual, page
  5-36, Box 12).

## To be decided

- formula to use in case of varying PU area
- a possibly updated user flow (this won't affect backend implementation)
