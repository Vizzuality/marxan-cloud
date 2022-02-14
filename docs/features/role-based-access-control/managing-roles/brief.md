# Managing user roles - Brief

This document complements the [main documentation for Role-based access
control](../brief.md), adding details about the workflow for assigning roles to
users within a Marxan Cloud instance.

The initial implementation is outlined here. Future reviews of this feature
may add the ability to invite users who don't yet have an account on the
instance, to add a role invitation step (which the grantee may accept or
reject), to restrict the list of users that can be discovered to those within
the parent organization/team of a project, etc.

These possible features would improve the ergonomics of the workflow for adding
users to projects or scenarios, but they also imply substantive additional
complexity which should be avoided for a first, functional implementation.

## Adding users to a project - workflow

- Project owners can click on a `+` (or similar) button next to the
  collaborators picture as per designs.

- By clicking that `+` button, a modal panel appears with a search box.

- Project owner searches for the user they want to add.

Project owners can search for *any* user within the instance, as long as their
account is active (that is, their email address was verified after account
creation, and their account is not marked as deleted).

Users can only be found by typing their full email address as used for their
Marxan Cloud account (case insensitive).

The reason for this is that on one hand we want to provide some kind of instant
feedback ("Am I adding a user correctly? Does a user with the given email
address exist and is their account active?"), while also slowing down manual
attempts to guess user email addresses from known/partial information. A
reasonable debouncing timing could also help to slow down automated guesses, if
desirable, in a future revision of the feature.

- Once the desired user is found, a visual confirmation is given (that is, the
  project owner needs to see that the email address they have typed is that of
  an active user)

- Project owner selects the user account just found, then:

  - they are presented with a dropdown to select the desired role of the new
    user within the relevant project (project owner, project contributor,
    project viewer or solution viewer)

  - this operation can be repeated to compile a list of users + roles as part of
    a batch assignment of user roles

   - they confirm the list of new users with their roles
   
   - users are granted their new roles instantly

- Then, each new user who has been granted a role on the project will see the
  new project on their dashboard with a little "new" or similar visual hint, and
  likewise for scenarios (current or that may be created in the future) within
  projects they have access to.

## Possible future workflow: scenario-specific roles

As access control checks for operations on scenarios (reading, editing,
deleting, running Marxan, etc.) are performed at scenario-level, the workflow
above can be extended in future project phases to cover granting users specific
roles on scenarios; at that stage, users with a role on a project can be granted
a different role on one or more scenarios, or outright denied access to a
scenario (for example, a project viewer could be granted scenario owner role on
a specific scenario, or a project contributor could be denied access from a
specific scenario within the project).
