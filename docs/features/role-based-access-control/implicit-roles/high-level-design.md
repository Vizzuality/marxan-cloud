# Implicit roles - high level design

A user who is added with *any* role to a project should *implicitly* be granted
a matching role on all the scenarios within the project, *except* when they
already have any explicit role on a scenario.

With *implicit* here we mean that:

* the role is identified as such in the `users_scenarios` table (this is done
  via the `is_implicit` boolean field)
* the role must be revoked as soon as *any* of the conditions through which it
  had been granted become void; for example, if a user became implicitly viewer
  of scenario X part of project Y when they became viewers of project Y, as soon
  as their viewer role on project Y is revoked, their implicit viewer role on
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

* Get the list of scenarios the user *already has an implicit role on*, as
  set `Cs` (Current implicit scenario roles).

* Calculate the following sets:

  * `Gs`: scenarios on which to grant a role, for a given user, as `Gs = Ps -
    Cs`

  * `GRs`: as above, but including *which* role they should be given on each
    scenario, by joining the role that the user has on the parent project of
    each scenario

  * `Rs`: scenarios from which to revoke roles, for a given user, as `Rs = Cs - Gs`.

* And finally, grant the roles in `GRs` and revoke the roles in `Rs`.

Some further details:

* the role the user is granted will match the one they have on the parent
  project
* as a corollary, the database triggers that calculate and apply implicit roles
  need to run `BEFORE INSERT OR UPDATE` and `AFTER DELETE` for roles on projects
* likewise, these triggers should also run `BEFORE INSERT OR UPDATE` for roles
  on scearios: this is so that if a user already has an implicit project on a
  scenario and is being granted an explicit role, this operation can be
  transparently result in an update of the user's role to an explicit one
* these triggers should also run `AFTER DELETE` for roles on scenarios: this is
  so that if a user is being revoked an explicit role, this can be replaced by
  the relevant implicit role
* when the user's role on parent projects is granted/changed/revoked, we always
  re-compute which scenarios they should have implicit access to, and calculate
  what needs changing (a sort of virtual ACL diffing).

## Testing implicit role management

Tests should cover the common situations that can lead to implicit roles being
granted or revoked:

```
All users roles in project must be replicated in a newly created scenario:

given userA and userB are created,
given a new project P is created by userA,
given that userB is granted role R on P
when userA creates a new scenario S in P
then userB should be granted role R on the new scenario
```

(repeating this for each of project owner, contributor, viewer roles as R for
userB)

```
All implicit users roles in a scenario should be revoked when revoked in the parent project:

given userA and userB are created,
given a new project P is created by userA,
given that userB is granted role R on P
given that userA creates a new scenario S in P
when userB's role on the parent project is revoked
then userB should have no role on scenario S
```

```
All changes in roles at project level should also result in updating implict scenario roles:

given userA and userB are created,
given a new project P is created by userA,
given that userB is granted role R on P
given that userA creates a new scenario S in P
when userB's role on the parent project is changed from R to R'
  (for example owner to viewer)
then userB's role on scenario S is updated to be R'
```

```
When a new scenario is created, implicit roles on it should be granted to users with role on the parent project:

given userA and userB are created,
given a new project P is created by userA,
given that userA creates a new scenario S in P
given that userB is granted role R on P
given that userA creates a new scenario T in P
then userB should be granted role R on scenario T
```
