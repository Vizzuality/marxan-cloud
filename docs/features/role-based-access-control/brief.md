# Role base access control - Brief

This document aims at providing an overview of Role-based Access Control (RBAC from here on) for the Marxan platform. 

In broad strokes, RBAC assumes the existence of a set of roles, which are associated with different actions that they 
can perform in the platform. Users can then be associated with roles for specific resources, which will grant them the 
role privileges for that specific resource.

The current implementation is based on the requirements described in the Requirements document.

## Roles

In the context of the Marxan platform, we will consider the following roles:

* **Owner**: represents a user that can perform any management actions for a specific resource of the platform (e.g. 
a project). This role is typically attributed initially to the user who created the resource (i.e. they own the resource).
* **Contributor**: represents a user with read-write access to a specific resource. Users with this role cannot manage 
the roles of users associated with a resource or delete the resource.
* **Viewer**: represents a user with read-only access to a given resource or particular part of the resource
(think of `solutions` for scenario, or map tiles)

Note: initially, we thought about considering "Temporal users" as a role, but since this feature will be achieved by 
using dedicated instances for training, this role will not be implemented.

In addition to the roles defined above, we will also consider **Platform admins**. Platform admins will be able to see
self-contained information about the projects like title/description, as well as delete them, but they will not be able to
see or manage their scenarios, solutions.

## Resources

We will consider the following entities as resources subject to RBAC:

* Organizations
* Projects
* Scenarios
* Solutions

Permissions have to be explicitly granted for a given user to have access to a given resource. There is no implicit access to
resources in the platform.
