# [API engineering] Published projects

* Date: 12 Oct 2021
* Status: draft
* Deciders: Alicia Arenzana, Kamil Gajowy, Alex Larrañaga, Dominik Ostrowski, Andrea Rota, Maciej Sikorski

## Context and problem statement
We need to decide how to implement published projects described [here](../hld/projects/publish/high-level-design.md)

## Decision drivers


## Considered options
### Solution 1
As the projects table already contains the is_public column we can add new columns related to the published version of the project.

#### Pros:
* Simple to add
#### Cons:
* It will increase the complexity of a project
* It can strongly affect the projectsCrudService

### Solution 2
We can add a new entity PublishedProject and table which will have its own name, description, ect. and will be in a 0-1 to 1 relation with Project.

#### Pros:
* This will separate the logic, and CRUD of these two cases.
#### Cons:
* We have to do a migration to the new db structure.

### Solution 3
ProjectCrud can base on some ProjectView (as true read model) which may connect both entities.

#### Pros:
* relatively easy to implement (ViewEntity extending Project and SomePublicView keys)
* does not require extending results (can be needed for isPublic if we want to be backward compatible)
#### Cons:
* high coupling to base service
* ProjectCrud allows us to do updates that will not be possible.

## Decision outcome
Solution 2

### Positive Consequences
It will be easier to maintain and add new logic when we have those concepts separated.
Additionally, if we make this decision now (before users can publish projects), there will be no problem with any migration. 

### Negative Consequences
We will have to prepare a simple migration, but then we have to maintain the strong relation between the public and original project.
If something already depends on is_public fields it has to be changed.

## References
[HLD](../hld/projects/publish)
