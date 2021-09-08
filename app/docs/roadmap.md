# FE Roadmap

## Async jobs
All the jobs should have an id to identify them. Then we will know when they finish, fail or whatever. If the API is going to run an async job after we POST/PATCH/PUT something it should return it somehow.

#### Get all async jobs from one project scenarios 'GET' `​/api​/v1​/projects/{pid}/scenarios/status`
It already exists. It's used in the project page

#### Get all async jobs from one scenario 'GET' `​/api​/v1​/scenarios​/{sid}/status`.
To get the async jobs only for one scenario.

#### Get one async job status 'GET' `​/api​/v1​/scenarios​/{sid}/status/{jobId}`.
To get status of only one job

#### Cancel one async job 'DELETE' `​/api​/v1​/scenarios​/{sid}/status/{jobId}`.
To delete/cancel one job execution

https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A21148





## Projects
Those endpoints are missing from the API

#### Download project 'GET' `​/api​/v1​/projects/{pid}/download`
It will be something easy from FE point of view. We have already implemented downloads like the cost-surface-template download

#### Upload project 'POST' `​/api​/v1​/projects/{pid}/upload`
It will be something easy from FE point of view. We have already implemented uploads in many places

#### Duplicate project 'POST' `​/api​/v1​/projects/{pid}/duplicate`
I think we need to think a little bit how this is going to work. I think that we should add a little modal/form with a name and description when you want to duplicate the project. So at the moment we POST it, it will be saved with a new name and description selected by the user

#### Upload custom grids 'POST' `​/api​/v1​/projects​/planning-grid​/shapefile`
If we want to add a custom grid we will need an endpoint similiar to this one. This will also add some dependencies to the project creation, because we will need to save an id or something similar to what we did with the planning area shapefile. At the moment of project creation we will send the temporary id of the planning grid uploaded
```json
{
  //...project name, description, etc.
  "planningGridId": "XXXX" // is genereated in `​/api​/v1​/projects​/planning-grid​/shapefile`
}
```



## Scenarios

#### Download scenario 'GET' `​/api​/v1​/scenarios/{sid}/download`
It will be something easy from FE point of view. We have already implemented downloads like the cost-surface-template download

#### Upload scenario 'POST' `​/api​/v1​/scenarios/{sid}/upload`
It will be something easy from FE point of view. We have already implemented uploads in many places

#### Duplicate scenario 'POST' `​/api​/v1​/scenarios/{sid}/duplicate`
Same as duplicate project

#### Compare scenario 'GET' `​/api​/v1​/scenarios​/compare/{sid1}/{sid2}​/tiles​/{z}​/{x}​/{y}.mvt`





## Features
#### Split ans intersect features
This was already developed but we need to check that it's working because it was refactored by the API. We couldn't do it because we doesn't have bioregional features

#### Upload custom features 'POST' `​/api​/v1​/projects​/{id}​/features​/shapefile`
Upload custom features. We need to change a little bit the UI to allow the user to add a name and a tag when you upload a custom feature.
I was also thinking that we should let the user select the properties for spliting. What is the current behaviour?


## Gap analysis

#### Search
It's not working in the API endpoint `​/api​/v1​/scenarios​/{id}​/features` and `/api/v1/scenarios/{id}/features/gap-data`

#### Download reports

https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A20975

https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=2991%3A21148

## Cost surface
If someone uploads a cost surface, they should be able to download the cost surface uploaded and the template. For doing this we need:

#### Get current cost surface 'GET' `​/api​/v1​/scenarios​/{id}​/cost-surface`
It should return a .zip file if the user has already uploaded one. Otherwise null.

#### Get min-max range 'GET' `​/api​/v1​/scenarios​/{id}​/cost-surface/range`
Migrate the current endpoint that is returning the min and max to this one. Just a naming change


## Adjust plaanning units
Everything is don here but, I ned to put a timeout of 500 milliseconds due to the lack of tracking async jobs. It would be a good point to start working with the async jobs ids.


## Published projects
We need to check/implement the new endpoints from the API



## Users
#### Validate sign-up 'POST' `​/api​/v1​/users​/me​/validate`
After sign-up, you should receive an email where you will click on a link. It will lead you to a page with a token that we will validate by requesting the enpoint above.

#### Forgot password 'POST' `​/api​/v1​/users​/me​/recover-password`
An endpoint where we will send an email payload and the API will send an email where you click and go to one page where we will validate a token that will allow you to change your current password by using a `PATCH` here `​/api​/v1​/users​/me​/password` with the token from the email

#### Roles and contributors
We need owners, contributors, etc

