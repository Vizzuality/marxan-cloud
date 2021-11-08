# Role base access control - development plan

This document describes the initial plan for the implementation of Role based access control for Marxan.

## Release 1 (early December 2021)

* Add the roles described in the HLD document: Owner, Contributor and Viewer.
* Creating the `access-control` module, exposing a facade that allows checking permissions for different resources.
* Update the already existing `projects-acl` implementation module to implement the defined interface.
* Create point-of-entry service in the `access-control` module that wraps the `projects-acl` module.
* Update existing calls of the `projects-acl` module to use `access-control` instead.
* Call the `access-control` service to check permissions for projects in the required places in the code.

## Release 2 (later)

* Implement platform admin users.
* Create `organizations-acl` module with a service to check access implementing the IAccessControlService interface
defined in the `access-control` module.
* Create `solutions-acl` module with a service to check access implementing the IAccessControlService interface
defined in the `access-control` module.
* Create `scenarios-acl` module with a service to check access implementing the IAccessControlService interface
defined in the `access-control` module.
