# Role base access control - Brief

This document represents the initial needs for a role based access control system.

These needs were described initially [in this document](https://docs.google.com/document/d/16x4wQYTKov0JkO1ue6iQzJ3-RXpdgQ38ygGJWW86Zo0/edit#),
and this document is a copy of that document at the time of writing.

## User requirements

### Full scope of user needs

#### User roles

* Platform admin
* Organization admin
* Organization contributor
* Project owner
* Project contributor
* Project reviewer (read-only)
* Project solution-viewer 
* Temporal user

#### User competencies

**Basic**

* Create an account
    * Name
    * Surname
    * Display name
    * Email
    * Avatar
* Verify email address
* Log-in/out
* See their profile
* Edit their profile
* Reset password
* Invite new users to the platform (via email)
* Accept or decline invitations to an organization with a given role
* Accept or decline invitations to a project with a given role
* Request joining organization
* Requests joining project
* Create organization
* Create project
* See all public projects
* See all my projects
* See all my organizations

**Projects**

* Project solution viewer: 
    * View only results
        * Only the solutions tab
        * No species map in gap analysis section of the solutions tab
        * Could we still show the gap analysis chart? (no map)

* Project reviewer: 
    * View project
        * Ability to comment on the project/scenarios as a non-technical stakeholder (this is a collaboration function ie. similar function to us commenting on the wireframes)

* Project contributor: 
    * Edit project (create and delete scenarios, change name and description, run Marxan)
    * See all users within project and their roles. The contributor of one project can see a list with the rest of the contributors and owners of that specific project.
    * See that the scenario  is being edited only by showing the "lock" icon somewhere visible to make it clear that someone blocked the modifications (needs discussion)

* Project owner: 
    * (Project contributor and...)
    * Invite new users to the project (inside the platform)
    * Invite users project with a given role
        * Invitations can be deleted.
        * If the user clicks on that link, the link won't work and the user can be presented with a message saying "the link is updated"
    * Manage users roles within project
        * More than one owner per project. 
            * Owner can name and remove other owners. 
        * Add/remove contributors. 
    * Remove users from project
    * Publish project
    * Publish only results
    * Sets security functions on different datasets ie the ability to hide data layers from reviewers but also within published projects.
    * Delete project and scenarios

**Organization**

* Organization contributor:
    * See all (?) projects within the organization.
    * See all users within organization and their roles (-228)
* Organization admin:
    * (Organization contributor)
    * Invite users to their organization (-223)
    * Manage users’ roles within the organization (-221).  

**Platform**

* Platform admin
    * Ask users to respond to a questionnaire (-756)
    * Block/Delete organizations
    * Block/Delete projects
    * Block/Delete users
    * Deriving analytics and KPIs
    * Ability to target email to users RE usage, updates, defunct accounts etc.
    * Manages public projects 

**Scenarios**

* Acquire an exclusive editing lock on a scenario:
    * While a user is editing a scenario, nobody else can make changes. 
    * The rest of the contributors can see who is editing. 
    * Users should be able to give up their editing lock on a scenario


### Phases

From all the above, what we consider in the current scope of work. 

### Needed for Demo

For the December demo, we only need students to have an account -- that will be likely removed after the training. Then they need to work on their own projects within that account.

The user accounts could even be pre-set before the workshop, but we need a way to create those users and delete all those accounts after the session.

#### Users roles

* Project owner
* Temporal user -- Dedicated instance for training will solve it.

#### User competencies

**Basic**

* Create an account (-234)
    * Name
    * Surname
    * Display name
    * Email
    * Avatar
* Log-in/out
* Create project
* See all public projects
* See all my projects

**Projects**

* Project owner: 
    * Edit project (create and delete scenarios, change name and description, run Marxan)
    * Publish project (-557, -762)
    * Delete project and scenarios 


### Current phase

#### Users roles

* Platform admin
* Project owner
* Project contributor
* Project reviewer (read-only)
* Project solution-viewer  [nice-to-have]
* Temporal user [nice-to-have, needs-discussion]


#### User competencies

**Basic**

* Create an account
    * Name
    * Surname
    * Display name
    * Email
    * Avatar
* Verify email address
* Log-in/out
* See their profile
* Edit their profile
* Reset password
* Create project
* See all public projects
* See all my projects

**Projects**

* Project solution viewer [nice-to-have]: 
    * View only results
        * Only the solutions tab
        * No species map in gap analysis section of the solutions tab
        * Could we still show the gap analysis chart? (no map)

* Project reviewer: 
    * View project

* Project contributor: 
    * Edit project (create and delete scenarios, change name and description, run Marxan)
    * See that the scenario  is being edited only by showing the "lock" icon somewhere visible to make it clear that someone blocked the modifications (needs discussion)

* Project owner: 
    * (Project contributor and...)
    * Manage users roles within project (-222)
        * More than one owner per project. 
            * Owner can name and remove other owners. 
        * Add/remove contributors. 
    * Remove users from project
    * Publish project (-557, -762)
    * Publish only results
    * Delete project and scenarios

**Organization**

* Organization contributor:
    * See all projects within the organization.
    * See all users within organization and their roles (-228)

* Organization admin:
    * (Organization contributor)
    * Manage users’ roles within the organization (-221).  

**Platform admin**

* Ask users to respond to a questionnaire (-756)