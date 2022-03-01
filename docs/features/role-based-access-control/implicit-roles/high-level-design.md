# Implicit roles - high level design

Users with any role on a project are granted an implicit role on all the
scenarios that belong to each projects they have a role on.

If users are explicitly granted a role on the scenario (currently, this will
happen only for the user who creates the scenario, who is granted
`scenario_owner` right after the scenario has been created), their role will be
updated as required by the explicit grant, and marked as explicitly granted.

The role they are implicitly granted on a scenario will match the role they have
on the project (so, owner => owner, and so on).

This is implemented via a SQL function that computes implicit roles, and a
second one that actually grants them and revokes them.

Database triggers are used to run the computation (and to perform any
grants/revokes, as applicable) when any roles are added/changed/revoked on any
entity (project or scenario) is created or deleted.

## Implementation details

A user who is added with *any* role to a project should *implicitly* be granted
a matching role on all the scenarios within the project, *except* when they
already have any explicit role on a scenario.

With *implicit* here we mean that:

* the role is identified as such in the `users_scenarios` table (this is done
  via the `is_implicit` boolean field)
* the role must be revoked as soon as *all* the conditions through which it had
  been granted become void; for example, if a user became implicitly viewer of
  scenario X part of project Y when they became viewers of project Y, as soon as
  their viewer role on project Y is revoked, their implicit viewer role on
  scenario X must be revoked *by materially deleting the relevant row* of the
  `users_scenarios` table (ideally these two operations should happen
  atomically);
* likewise, if a user who has been granted an implicit viewer role on a scenario
  is then *explicitly* given any role on the same scenario, their implicit
  viewer role must be revoked (ideally this should happen atomically with the
  explicit granting of a new role)
* and finally, when a user has an explicit role on a scenario *and* any role on
  a parent entity (i.e. the scenario's parent project), if their explicit role
  on a scenario is *revoked*, they should contextually be granted an implicit
  viewer role on the scenario (this translates to the requirement of computing
  implicit roles and applying any changes also when a scenario role is granted
  or revoked, not only when any project role is granted/changed/revoked)

In practice, the computation works as outlined below.

We compute grant and revoke sets for implicit scenario roles.

* Given a user

* Whenever their *explicit* role on any entity (project or scenario) is changed
  in any way (created/changed/deleted),

* Get the list of all the scenarios that belong to any of the projects the
  user has any roles on, as set `Ps` (Project scenarios).

* Get the list of scenario the user has any *explicit* roles on, as set `Es`
  (Explicit scenario roles).

* Compute the set difference between `Ps` and `Es` as set `Is` (Implicit
  scenario roles): `Ip = Ps - Es`. This is the set of scenarios the user should
  have an implicit role on.

* Get the list of scenarios the user *already has an implicit role on*, as
  set `Cs` (Current implicit scenario roles).

* Calculate the following two sets:

  * `Gs` (grant) as `Gs = Is - Cs`, joining the role that the user has on the
    parent project of each scenario

  * `Rs` (revoke) as `Rs = Cs - Is`.

* And finally, grant the roles in `Gs` and revoke the roles in `Rs`.

Some further details:

* the role the user is granted will match the one they have on the parent
  project
* as a corollary, the database triggers that calculate and apply implicit roles
  need to run `BEFORE INSERT OR UPDATE` or `AFTER DELETE` of roles on projects
  or scenarios
* when the user's role on parent projects is granted/changed/revoked, we always
  re-compute which scenarios they should have implicit access to, and calculate
  what needs changing (a sort of virtual ACL diffing).
