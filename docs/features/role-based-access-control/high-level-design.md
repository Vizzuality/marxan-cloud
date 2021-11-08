# Role base access control - High-level design

This document aims at providing an overview of the architecture of Role-based Access Control (RBAC from here on) for
the Marxan platform.

## Roles

Platform administrators should be identified in a database table dedicated for the purpose. Adding users to the admins
DB table should only be done by other admin users.

The remaining roles supported by the platform (`Owner`, `Contributor` and `Viewer`) will be stored in the `roles` 
database in the `marxan-api` database. These roles should cover the roles defined in the project requirements:

* "Platform admin" would be achieved with the implementation of a dedicated DB table for platform admins;
* "Project owner" -> role Owner for resource Project;
* "Project contributor" -> role Contributor for resource Project;
* "Project reviewer (read-only)" -> role Viewer for resource Project;
* "Project solution-viewer" -> role Viewer for resource "Solutions";

Roles should have numerical values associated to them, to identify the hierarchical order between them. For instance:

* `Owner` -> 1000
* `Contributor` -> 500
* `Viewer` -> 250

Roles with fewer privileges should have lower numerical values than roles with more privileges. Using numerical values
for roles allows for easily comparing if a given user has certain privileges (e.g. checking if a user has the role 
`Contributor` can be easily done: `role >= Contributor (500)`).

There is also an implicit relationship between platform actions and the supported roles. By default, it is assumed that:
  * a user with role `Viewer` can read the information for the given resource (which usually includes calls to 
`GET resource` and `GET resource/:id` endpoints).
  * user with role `Contributor` can perform all the actions a `Viewer` can, as well as edition actions for the given
resource (which usually includes calls to `PATCH/PUT resource/:id` endpoints).
  * user with `Owner` role can perform all the actions a `Contributor` can, as well as deleting actions for the given
resource (which usually includes calls to `DELETE resource/:id` endpoints).

**However, it is up to the functions implementing each feature (modules, controllers, services or any other kind of 
object in the context of the API) to correctly check permissions for the action being performed.** This also applies
to custom actions that might be subject to RBAC: for instance, if publishing a project is a custom action that should be
subject to RBAC, then it is up to the controller action, service method, or wherever we need to do this, to check that 
the user performing the request has the required role (e.g. `Owner`) to perform that action.

Currently, these are the roles required to perform the following actions in the platform:

| Actions / Roles    | Scenario Viewer | Scenario Contributor | Scenario Owner | Project Viewer | Project Contributor | Project Owner | Organization Viewer | Organization Contributor | Organization Owner | Platform admin |
|--------------------|:---------------:|:--------------------:|:--------------:|:--------------:|:-------------------:|:-------------:|:-------------------:|:------------------------:|:------------------:|:--------------:|
| Edit project       | n               | n                    | n              | n              | Y                   | Y             | n                   | Y                        | Y                  | Y              |
| Publish my project | n               | n                    | n              | n              | n                   | Y             | n                   | n                        | Y                  | Y              |
| Delete project     | n               | n                    | n              | n              | n                   | Y             | n                   | n                        | Y                  | Y              |
| Delete scenario    | n               | n                    | Y              | n              | n                   | n             | n                   | n                        | Y                  | Y              |

## Association between roles and users for resources

The association between roles and users for resources will be stored in database tables in the `marxan-api` database,
using one database table for each resource:
* `users_organizations` will store the roles of users inside organizations.
* `users_projects` will store the roles of users inside projects.
* `users_scenarios` will store the roles of users inside scenarios.

These tables should contain columns for `user_id`, `role` and the resource id (`organization_id`, `project_id` and 
`scenario_id`, respectively).

## Architecture

A main module `access-control` should be created, which will be the main point-of-contact for checking permissions. 
Additionally, we will have specific modules for checking permissions for each of the resources supported:
* `organizations-acl`: module that controls access to organizations;
* `projects-acl`: module that controls access to projects;
* `scenarios-acl`: module that controls access to scenarios;
* `solutions-acl`: module that controls access to solutions;

This `access-control` module will expose a public service, and this is the point of entry that should be used by other 
services to control access to resources. The `access-control` module will also contain the interface that should be 
implemented the services in the resource-specific modules, which these should implement.

This interface is called `IAccessControlService` and it is located in `api/apps/api/src/modules/access-control/access-control-service.interface.ts`.

The following diagram illustrates how access should be controlled across the application:

![Access control architecture diagram](./architecture-diagram.png)
