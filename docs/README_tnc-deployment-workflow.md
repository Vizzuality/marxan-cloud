# Deployment workflow for TNC instances

This document outlines the deployment flow to be used as reference when merging
changes for deployment to the flagship MaPP instance on TNC's infrastructure.

This workflow assumes that development of new features and fixes is done on a
fork of TNC's `marxan-cloud` repository, and that changes are then brought into
TNC's repository.

Any changes made by the TNC team within then TNC's `marxan-cloud` repository
should be backported to forks where new features and fixes are developed: once
this is done, the assumption above will still apply.

## Development workflow

The development flow will be mainly up to the relevant development teams, but in
general, a lightweight "[GitHub
Flow](https://docs.github.com/en/get-started/quickstart/github-flow)" may be
used, such as the one outlined below:

- Develop changes in feature branches, rebased on `develop`
- Review and test changes
- When ready, merge to `develop`
- QA in a development environment

For reference, the workflow used during the initial phase of development is
[outlined in the repository's main README
document](../README.md#development-workflow-tbd).

## Deployment workflow

Implementing the flow suggested in this section, including ad-hoc steps and
variations as may be needed in specific circumstances, will be up to the teams
involved (development teams and TNC's infrastructure/operations team): a basic
flow is proposed here as baseline.

This workflow assumes that TNC's `staging` and `production` branches incorporate
all the changes from TNC's own `develop` - in other words, it assumes that
`staging` and `production` are used only to trigger deployments on the
respective AKS clusters, and not as development branches where changes are
carried on without first landing them in the `develop` branch.

Or even more succintly: `develop` should always be the source of truth.

Given these assumptions, once changes in a downstream repositories have been
merged into the downstream `develop` branch, the reference deployment flow
should be:

1. Sync changes and deploy to TNC's staging cluster

  - Downstream, merge the upstream `tnc/develop` branch into the downstream
    `develop` branch (this will make sure any changes applied on TNC's side are
    incorporated downstream).
  - Downstream, push the resulting, merged `develop` branch to TNC's repository.
  - Downstream, merge `develop` into a downstream branch that is used to sync
    with TNC's `staging` (for example, `tnc-staging`): this is so that
    downstream forks can keep a local branch that tracks upstream's `staging`,
    for extra checks, reference and so on.
  - Push downstream's `tnc-staging` to `tnc/staging` (this will trigger CI and
    CD pipelines, with eventual deployment on TNC's staging cluster).

2. QA in TNC's staging environment

  - Developer CFT (Critical Functionality Testing) in the TNC staging
    environment
  - QA tests
  - User acceptance tests
  - Any other checks as required, and depending on the nature and extent of
    changes (for example, stress testing, etc.)

If QA steps in the staging environment allow to proceed with deployment to
production, the process can move on to the following stages.

3. Deploy to TNC's production cluster

This part of the flow assumes that all the changes that have been validated in
the TNC staging environment are still current and latest: that is, if any
further changes have been deployed to the TNC staging environment after the QA
steps (for example, a distinct set of features/fixes has been deployed for
validation), key steps of the QA/validation process should be repeated to make
sure that there are no regressions introduced in the meanwhile.

Moreover, if further changes have been deployed to the TNC staging environment,
synchronization of TNC's `develop` and `staging` to their downstream counterpart
branches (within section 1. above) should be repeated.

In general, especially if extra care cannot always taken to keep downstream
`staging`, `production`, `tnc-staging` and `tnc-production` branches in sync
with upstream, the steps below can only serve as a broad checklist but the flow
should always be followed with utmost care in order to achieve the intended
results.

  - Downstream, sync the upstream `tnc/production` branch to a downstream branch
    that is used to track TNC's `production` (for example, `tnc-production`).
  - Downstream, merge `tnc-staging` into `tnc-production`.
  - Push downstream's `tnc-production` to `tnc/production` (this will trigger CI
    and CD pipelines, with eventual deployment on TNC's production cluster).
