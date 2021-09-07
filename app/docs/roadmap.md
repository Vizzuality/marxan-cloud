# FE Roadmap

## Async jobs
All the jobs should have an id to identify them. Then we will know when they finish, fail or whatever. If the API is going to run an async job after we POST/PATCH/PUT something it should return it somehow.

#### 'GET' `​/api​/v1​/projects/{pid}/scenarios/status`
It already exists. It's used in the project page

#### 'GET' `​/api​/v1​/scenarios​/{sid}/status`.
To get the async jobs only for one scenario.

#### 'GET' `​/api​/v1​/scenarios​/{sid}/status/{jobId}`.
To get status of only one job

## Projects
Those endpoints are missing from the API

#### 'GET' `​/api​/v1​/projects/{pid}/download`
It will be something easy from FE point of view. We have already implemented downloads like the cost-surface-template download

#### 'POST' `​/api​/v1​/projects/{pid}/duplicate`
I think we need to think a little bit how this is going to work. I think that we should add a little modal/form with a name and description when you want to duplicate the project. So at the moment we POST it, it will be saved with a new name and description selected by the user

#### 'POST' `​/api​/v1​/projects​/planning-grid​/shapefile`
If we want to add a custom grid we will need an endpoint similiar to this one. This will also add some dependencies to the project creation, because we will need to save an id or something similar to what we did with the planning area shapefile. At the moment of project creation we will send the temporary id of the planning grid uploaded
```json
{
  //...project name, description, etc.
  "planningGridId": "XXXX" // is genereated in `​/api​/v1​/projects​/planning-grid​/shapefile`
}
```

## Scenarios

#### 'POST' `​/api​/v1​/scenarios/{sid}/duplicate`
Same as duplicate project

## Cost surface
If someone uploads a cost surface, they should be able to download the cost surface uploaded and the template. For doing this we need:

#### 'GET' `​/api​/v1​/scenarios​/{id}​/cost-surface`
should return a .zip file if the user has already uploaded one. Otherwise null.

#### 'GET' `​/api​/v1​/scenarios​/{id}​/cost-surface/range`
migrate the current endpoint that is returning the min and max to this one


## Published projects
We need to check/implement the new endpoints from the API
