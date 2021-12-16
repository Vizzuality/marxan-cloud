# Scenario creation/editing workflow - Frontend

This document still does not contemplate the calls necessary to obtain the information regarding:

* Which tabs need to be updated to be able to run a scenario `red warning`
* Which tabs do not need to be updated to be able to run a scenario but do not correspond to the information given in the previous run (outdated information). `yellow warning`
* When it is necessary to display the Recalculate action and when the Re-run action.

In addition, there is a missing call to Recalculate and be able to exempt the application from an overexertion, in the event that this possibility exists.

## Planning units

### Protected areas

GET SCENARIO
'scenarios/${scenarioId}'

GET WDPA
'scenarios/${scenarioId}/protected-areas'

POST upload protected areas
'scenarios/${scenarioId}/protected-areas/shapefile'

POST protected areas
'scenarios/${scenarioId}/protected-areas'

PATCH scenario
'scenarios/${scenarioId}'

GET scenario status
'projects/${projectId}/scenarios/status'

### Adjusting planning unit

### Cost surface


## Features

### Set up features

### Gap analysis


## Parameters

### BLM calibration

### Advance settings


## Solutions

### Solutions overview

### Schedule scenario