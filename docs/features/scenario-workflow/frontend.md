# Scenario creation/editing workflow - Frontend

This document still does not contemplate the calls necessary to obtain the information regarding:

* Which tabs need to be updated to be able to run a scenario `red warning`
* Which tabs do not need to be updated to be able to run a scenario but do not correspond to the information given in the previous run (outdated information). `yellow warning`
* When it is necessary to display the Recalculate action and when the Re-run action.

In addition, there will be missing next calls:
* Add and edit Advanced settings.

* Add, edit and obtain output of BLM.

* Recalculate and be able to exempt the application from an overexertion, in the event that this possibility exists.

## Planning units

### Protected areas

**GET SCENARIO**
'/scenarios/${scenarioId}'

**GET WDPA**
'/scenarios/${scenarioId}/protected-areas'

**POST upload protected areas**
'/scenarios/${scenarioId}/protected-areas/shapefile'

**POST protected areas**
'/scenarios/${scenarioId}/protected-areas'

**PATCH scenario**
'/scenarios/${scenarioId}'

**GET scenario status**
'/projects/${projectId}/scenarios/status'

### Adjusting planning unit

**GET scenario PU**
'/scenarios/${scenarioId}/planning-units'

**POST scenario PU**
'/scenarios/${scenarioId}/planning-units'

**POST upload scenario PU**
'/scenarios/${scenarioId}/planning-unit-shapefile'

### Cost surface

**GET download cost surface template**
'/scenarios/${scenarioId}/cost-surface/shapefile-template'

**GET upload cost surface**
'/scenarios/${scenarioId}/cost-surface/shapefile'

## Features

### Set up features

**GET SCENARIO**
'/scenarios/${scenarioId}'

**PATCH scenario**
'/scenarios/${scenarioId}'

**GET all features**
'/projects/${projectId}/features'

**POST upload feature**
'/projects/${shapefileId}/features/shapefile'

**POST save selected features**
'/scenarios/${scenarioId}/features/specification'

**GET selected features + target features**
'/scenarios/${scenarioId}/features/specification'

**GET feature**
'/geo-features/featureId'

### Gap analysis

**GET pre gap analysis**
'/scenarios/${scenarioId}/features/gap-data'

**GET post gap analysis**
'/scenarios//${scenarioId}/marxan/solutions/gap-data'
## Parameters

### BLM calibration
Add new endpoints 
### Advanced settings
Add new endpoint (not part of run anymore)


## Solutions

### Solutions overview

**GET solutions**
'/scenarios/${scenarioId}/marxan/solutions'

**GET solution**
'/scenarios/${scenarioId}/marxan/solutions/solutionId'

**GET most diff solutions**
'scenarios/${scenarioId}/marxan/solutions/most-different'

**GET best solution**
'/scenarios/${scenarioId}/marxan/solutions/best'

**GET download solutions**
'/scenarios/${scenarioId}/marxan/output'

### Schedule scenario
Not still in scope