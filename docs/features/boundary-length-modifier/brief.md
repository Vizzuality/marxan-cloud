# BLM Calibration - brief

This document describes the current high-level overview of the Marxan Cloud
platform user features related to calibration of the BLM (boundary length
modifier) for a Marxan scenario.

## Aim

The BLM value chosen for a Marxan analysis can greatly affect the spatial
distribution/clumping of planning units selected by the solver.

The BLM calibration process designed for the Marxan Cloud platform will allow
users to have an “at a glance” overview of the spatial distribution of
solutions, given a discrete set of BLM values.

This process is optional for the user, and it is designed to be run once all
the other settings of a scenario have been finalized, just before running the
Marxan solver on a scenario.

If the user doesn't provide a BLM value either directly (if they have calculated
it through their own process/tooling) or by running the calibration process and
choosing one of the values suggested, a default BLM value of `0` will be used
(therefore removing boundary length from scenario considerations altogether: see
section 5.3.1.1 of the Marxan manual).

The overview is presented to the user via a plot of the cost of the best
solution for each of the BLM values being used in the calibration process (x
axis) vs the related boundary length (y axis); to each of these data points is
associated a thumbnail snapshot of the best solution for the given BLM value.

Once the calibration results are presented to the user, they may then choose to:

- Select one of the calibrated BLM values, to implement in the scenario (this
  will set the BLM property for the scenario)
- Change the settings (`[min, max]` range, see below) of the previous
  calibration run and then re-run the calibration
- Input their own BLM value (without using the platform's calibration feature)

## Overview of the process

For an overview of the process, see `data/notebooks/Lab/marxan_blm.ipynb`.

The gist: this is done by running the Marxan solver on the same input files that
would be used for the actual user-triggered Marxan run, once per BLM value in
the given range, with a limited number of iterations per run (10) and only
varying the BLM value in the input.dat file, all the rest being kept equal
across each of the runs.

## Requirements

- Users should be able to set their BLM values, by supplying a `[min, max]`
  range, from which the BLM calibration process will derive a set of BLM values
  to use by splitting the domain in equal intervals, according to the formula
  below.

Whereas the user input consists in exactly two values, the derived set of values
to be used for the calibration process should be limited to a small cardinality:
6 values for the initial implementation, but leaving space for adjustments in
the future (i.e. it is ok to hardcode the size of the set, but changing it in
the future should not break other assumptions).

- Given a `[min, max]` range and a cardinality of `N` for the set of BLM values
  to be used, the actual values are derived as:

```
blmValues(min, max) = [
  min,
  (min + ((max-min) / N-1)) * 1,
  (min + ((max-min) / N-1)) * 2,
  ...,
  (min + ((max-min) / N-1)) * N-1
]
```

- The 6 values given by default will be `BLM = Z*sqrt(PU area)` (with `Z ∈
  blmValues(0.001, 100)`).
  
This will apply for the majority of projects, which are expected to use a
constant PU area. Some projects may use irregularly-shaped planning units with
varying area: in this case the mean of the areas of the planning units in the
study area should be used, with option to further tune this in the future
(as above, it is ok to hardcode this, as long as using a different aggregation
formula that doesn't depend on other inputs than PU area and PU count will not
break other assumptions).

- For each of the BLM values being used in the calibration process:

  - Cost vs boundary length of the best solution, plotted on a chart
  - Thumbnail of the best solution, displayed alongside the curve for visual
    inspection.

- No need to do curve fitting and elbow search.

- No recommended value (as corollary of the above).

- A line chart will be shown to users, but it will reflect the actual values
  (being or not a curve).

For reference, the initial functional design involved:

- Using a *fixed* set of BLM values (6 of them), to be used for every
  project/scenario.

- Curve fitting across the resulting cost vs boundary length points.

- Optimal value selected as the “elbow” of the curve (see Marxan manual, page
  5-36, Box 12).

## To be decided

- formula to use in case of varying PU area
- a possibly updated user flow (this won't affect backend implementation)
