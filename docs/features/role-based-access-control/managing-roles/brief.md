# Managing user roles - Brief

This document complements the [main documentation for Role-based access
control](../brief.md), adding details about the workflow for assigning roles to
users within a Marxan Cloud instance.

The initial implementation is outlined before. Future reviews of this feature
may add the ability to invite users who don't yet have an account on the
instance, to add a role invitation step (which the grantee may accept or
reject), to restrict the list of users that can be discovered to those within
the parent organization/team of a project, etc.

These possible features would improve the ergonomics of the workflow for adding
users to projects or scenarios, but they also imply substantive additional
complexity which should be avoided for a first, functional implementation.

## Adding users to a project or a scenario - workflow

- Project/scenario owners can click on a `+` (or similar) button next to the
  collaborators picture as per designs.

- By clicking that `+` button, a modal panel appears with a search box.

- Project/scenario owner searches for the user they want to add.

Project/scenario owners can search for *any* user within the instance, as long
as their account is active (that is, their email address was verified after
account creation, and their account is not flagged as deleted).

Users can only be found by typing their full email address as used for their
Marxan Cloud account (case insensitive).

The reason for this is that on one hand we want to provide some kind of instant
feedback ("Am I adding a user correctly? Does a user with the given email
address exist and is their account active?"), while also slowing down manual
attempts to guess user email addresses from known/partial information. A
reasonable debouncing timing could also help to slow down automated guesses, if
desirable, in a future revision of the feature.

- Once desired user is found, a visual confirmation is given (that is, the
  project/scenario owner needs to see that the email address they have typed is
  that of an active user)

- Project/scenario owner selects the user account just found, then:

  - they are presented with an dropdown to select the desired role of the new
    user within project/scenario

  - this operation can be repeated to compile a list of users + roles as part of
    a batch assignment of user roles

   - they confirm the list of new users with their roles
   
   - users are granted their new roles instantly

- Then, each new user who has been granted a role on the project/scenario will
  see the new project on their dashboard with a little “new“ or similar
  indication, and likewise for new scenarios they are given access to, within
  projects they already have access to.
