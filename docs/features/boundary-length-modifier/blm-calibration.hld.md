# BLM Calibration - high-level design

This document describes the current high-level overview of the Marxan Cloud
platform user features related to calibration of the BLM (boundary length
modifier) for a Marxan scenario.

## Aim

The BLM value chosen for a Marxan analysis can greatly affect the spatial
distribution/clumping of planning units selected by the solver.

The BLM calibration process designed for the Marxan Cloud platform will allow
users to have an “at a glance” overview of the spatial distribution of solutions
given a discrete set of BLM values.

The overview is presented to the user via a thumbnail snapshot of the solutions
for each BLM value being tested, alongside the cost of solutions for each run.

The user may then choose to:

- Select one of the calibrated BLM values, to implement in the scenario (this
  will set the BLM property for the scenario)
- Change one or more 6 values of the previous calibration run, and re-run the
  calibration
- Input their own BLM value (without using the platform's calibration feature)

## Implementation decisions

For an overview of the process, see `data/notebooks/Lab/marxan_blm.ipynb`.

The gist: this is done by running the Marxan solver on the same input files that
would be used for the actual user-triggered Marxan run, once per BLM value in
the given range, with a limited number of iterations per run (10) and only
varying the BLM value in the input.dat file, all the rest being kept equal
across each of the runs.

The initial functional design involved:

- Using a fixed set of BLM values (6 of them)
- Curve fitting across the resulting scores
- Optimal value selected as the “elbow” of the curve (see Marxan manual, page
  5-36, Box 12)
- Thumbnails of each run’s solutions displayed alongside the curve for visual
  inspection

Updated requirements:

- Users should be able to set their BLM values (the set should still be limited
  to a small number, e.g. 6 values). The 6 values given by default will be `BLM
  = Z*sqrt(PU area)` (with `Z`  being  `0.001`, `0.01`, `0.1`, `1`, `10` and
  `100`)
- No need to do curve fitting and elbow search
- No recommended value
- The line chart is still necessary, but it will reflect the actual values
  (being or not a curve)

Clarify:

- Which PU area value can be used in case of a PU grid with irregular
  shapes/areas for each PU?
