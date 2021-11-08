# Role base access control - development plan

This document describes the initial plan for the implementation of Role based access control for Marxan.

## Release 1 (early December)

* Add the roles described in the HLD document: Owner, Contributor and Viewer.
* Create the Access control module, exposing a facade that allows to check permissions for different resources.
* Define the interface for Access control services, inside the Access control module.
* Create the Access control service for projects, implementing the Access control interface, in a submodule specific 
for project permission management.
* Usage of the project Access control service to restrict access to project features, according to the correct roles.

## Release 2 (later)

* Create the Access control service for organizations, implementing the Access control interface, in a submodule 
specific for organization permission management.
* Create the Access control service for scenarios, implementing the Access control interface, in a submodule 
specific for scenario permission management.
* Create the Access control service for solutions, implementing the Access control interface, in a submodule
specific for solution permission management.
* Implement the hierarchical relationship between the different resources supported.
* Implementation of platform admin users.
