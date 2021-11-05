# Role base access control - High-level design

This document aims at providing an overview of the architecture of Role-based Access Control (RBAC from here on) for
the Marxan platform.

## Roles

Platform administrators should be identified by a boolean attribute in the users table (`is_admin`). This attribute can
only be edited by other platform administrators, and it must not be editable by the user when editing their profile.

The remaining roles supported by the platform (`Owner`, `Contributor` and `Viewer`) will be stored in the `roles` 
database in the `marxan-api` database.

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

**However, it is up to each controller method to correctly check permissions for the action being performed.** This also applies
to custom actions that might be subject to RBAC: for instance, if publishing a project is a custom action that should be
subject to RBAC, then it is up to the controller action to check that the user performing the request has the required role 
(e.g. `Owner`) to perform that action.

## Association between roles and users for resources

The association between roles and users for resources will be stored in database tables in the `marxan-api` database,
using one database table for each resource:
* `users_organizations` will store the roles of users inside organizations.
* `users_projects` will store the roles of users inside projects.
* `users_scenarios` will store the roles of users inside scenarios.

These tables should contain columns for `user_id`, `role` and the resource id (`organization_id`, `project_id` and 
`scenario_id`, respectively).

## Implementation details

In terms of implementation, the existing module `projects-acl` should be renamed to a more generic name such as 
`access-control` or `rbac` (though I'm not a fan of acronyms as names of modules). This module will be used across 
the platform as the "single-source-of-truth" to check whether users are allowed to access given resources.

This module, for now, will support checking permissions for the 3 resources subject to RBAC: organizations, projects and
scenarios. For this, this module should provide 3 services, each of them implementing the following interface:


`isOwner(resourceId: string, userId: string): boolean`

Checks if the given user can perform the actions of a `Owner` for the provided resource id. This method should return 
`true` if one of the following conditions apply:

* the user is a platform admin;
* the user has a role greater or equal to `Owner` for the resource being checked in the corresponding table (e.g. when 
 checking if a user is owner of a project, `this.projectAclService.isOwner(projectId, userId)`, there must be a record 
 in the `users_projects` table with role greater or equal to `Owner`).
* the user has a role greater or equal to `Owner` for a resource hierarchically superior to the one being checked (e.g. 
 again using projects as an example, if there is no record in the `users_projects` table, but there is a record for the 
 given user with role greater or equal to `Owner` for the organization that owns the project).


`isContributor(resourceId: string, userId: string): boolean`

Checks if the given user can perform the actions of a `Contributor` for the provided resource id. This method should 
return `true` if one of the following conditions apply:

* the user is a platform admin;
* the user has a role higher than `Contributor` for the resource being checked in the corresponding table (e.g. when 
 checking if a user is contributor of a project, `this.projectAclService.isContributor(projectId, userId)`, there must 
 be a record in the `users_projects` table for the role greater or equal to `Contributor`).
* the user has the role higher than `Contributor` for a resource hierarchically superior to the one being checked (e.g. 
 again using projects as an example, if there is no record in the `users_projects` table, but the user has a role higher 
 or equal to `Contributor` for the organization that owns the project).


`isViewer(resourceId: string, userId: string): boolean`

Checks if the given user can perform the actions of a `Viewer` for the provided resource id. This method should return 
`true` if one of the following conditions apply:

* the user is a platform admin;
* the user has a role higher than `Viewer` for the resource being checked in the corresponding table (e.g. when
  checking if a user is contributor of a project, `this.projectAclService.isViewer(projectId, userId)`, there must
  be a record in the `users_projects` table for the role greater or equal to `Viewer`).
* the user has the role higher than `Viewer` for a resource hierarchically superior to the one being checked (e.g.
  again using projects as an example, if there is no record in the `users_projects` table, but the user has a role higher
  or equal to `Viewer` for the organization that owns the project).
