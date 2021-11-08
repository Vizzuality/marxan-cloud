# Role base access control - Brief

This document aims at providing an overview of Role-based Access Control (RBAC from here on) for the Marxan platform. 

In broad strokes, RBAC assumes the existence of a set of roles, which are associated with different actions that they 
can perform in the platform. Users can then be associated with roles for specific resources, which will grant them the 
role privileges for that specific resource.

The current implementation is based on the requirements described in the [User requirements document](https://docs.google.com/document/d/16x4wQYTKov0JkO1ue6iQzJ3-RXpdgQ38ygGJWW86Zo0/edit#heading=h.58xbt2es73r2).

## Roles

In the context of the Marxan platform, we will consider the following roles:

* **Admin**: a generic platform administrator, who can perform **any action for any resource** in the platform.
* **Owner**: represents a user that can perform any management actions for a specific resource of the platform (e.g. 
a project). This role is typically attributed to the user who created the resource (i.e. they own the resource).
* **Contributor**: represents a user with read-write access to a specific resource. Users with this role cannot manage 
the roles of users associated with a resource or delete the resource.
* **Viewer**: represents a user with read-only access to a given resource or particular part of the resource (think of `solutions` for scenario, or map tiles)

Note: initially, we thought about considering "Temporal users" as a role, but since this feature will be achieved by 
using dedicated instances for training, this role will not be implemented.

## Resources

We will consider the following entities as resources subject to RBAC:

1. Organizations
2. Projects
3. Scenarios

The entities stated above will work in a hierarchical way: roles granted to users in organizations also apply to all 
projects owned by said organization, as well as all scenarios in all projects owned by the organization.

However, this hierarchical behavior can be overwritten in a case-by-case basis if needed - e.g. a given user can be 
"contributor" for an organization, but have "owner" privileges for a specific project inside (or outside) that 
organization.

**Keep in mind that permissions have to be explicitly granted for a given user to have access to a given resource.**
