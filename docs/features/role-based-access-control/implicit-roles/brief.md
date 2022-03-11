# Implicit roles - brief

Users with any role on one or more projects are granted an implicit role on all
the scenarios that belong to each project they have a role on.

The role they are implicitly granted on a scenario will match the role they have
on the project (so, owner => owner, and so on).

If users are then explicitly granted a role on a scenario (currently, this will
happen only for the user who creates the scenario, who is granted
`scenario_owner` right after the scenario has been created, or by managing
scenario roles directly via the API, but not via the web app), their role will
be updated as required by the explicit grant, and marked as explicitly granted.

For example, a user with a `project_viewer` role on a project P will be
automatically granted an implicit `scenario_viewer` role on any scenarios within
the project. If they create a new scenario within project P, they will be
automatically granted a `scenario_owner` role on their new scenario. A user with
`project_owner` role on project P can also grant them `scenario_contributor`
role on any scenario, thereby replacing the `scenario_viewer` role they were
implicitly granted on the scenario.

Granting of implicit roles is implemented via a plpgsql function that computes
implicit roles, and a second one that actually grants them and revokes them.

Database triggers are used to run the computation (and to perform any
grants/revokes, as applicable):

1. when any roles are added/changed/revoked on projects, or
2. when new scenarios are created within an existing project

The first case ensures that roles are synchronized between projects and existing
scenarios; the second case ensures that roles are synchronized between projects
and new scenarios being created within these projects.

## Possible future evolution

If roles on other layers of container entities (such as parent organizations for
projects) are explicitly handled at some point in the future, the strategy
discussed here and in the related HLD document will need to be updated to
propagate role changes from (for example) organizations to projects, eventually
trickling down to scenarios through the existing strategy described above.