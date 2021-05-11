# API - development workflow

This document outlines a proposed general workflow for the development of
features in the API and GeoProcessing services.

As the development team scales out, it is desirable to follow (flexibly) a
workflow that allows to optimize clarity and parallel work.

## Checklist

### Alignment on requirements for a component

* are all the project team members aware of the user-value of the component?
* are there any assumptions implicit in the design that need clarification or
  adjustment (because of product needs or because of technical or other
  limitations)?

### definition of the API interface(s)

* which "resources" (in a REST meaning) need to be handled?
* which endpoints are needed?
  * should any *existing* endpoint be changed?
  * are *new* endpoints needed?
  * should the new endpoints share part of the URL path with existing
    endpoints? (this is partly related to a section below on fronting
    implementation details with a simpler public interface)
* at this stage we should create all the relevant DTOs for create, update and
  get payloads (requests and responses), as well as all relevant types
* if relevant, Swagger documentation may be added now (or after the stub
  implementation, see below)
  
At this stage we should have full typing as well as scaffolded endpoints. These
would do little by now, except validating payload shape.

### API e2e tests

* we should aim to add at least happy-path e2e tests as one of the first
  implementation steps
* this means that we should create e2e tests that mimic real requests the API
  may receive from API clients, starting from the frontend app
* e2e tests should use DTOs and types from the previous step
* e2e tests should cover the space between API consumers/clients and the API
  itself: we should test up to and including this boundary but not beyond; for
  example, we should not test that Redis or BullMQ work as intended, as they are
  covered (or should be) by their own tests upstream
* the API boundary in this context includes the GeoProcessing service, as the
  actual API service only acts as a simple API gateway towards the GeoProcessing
  service: that some requests are handled in practice by the GeoProcessing
  service should be considered an implementation detail that API consumers
  should not be concerned with
* requests whose processing extends beyond the API/GeoProcessing boundary should
  only be tested up to the point of dispatching requests to external systems
  (whether via API calls, triggering jobs via message queues, etc.)
* for example, if e2e-testing a request that involves an asynchronous geospatial
  calculation handled via BullMQ workers, we should make sure requests from API
  clients end up adding the appropriate job to the relevant queue
* we should obviously still test that given relevant job descriptions, an
  asynchronous worker will try to perform the associated task (or reject the
  job request, if this is incomplete, malformed, cannot be authorized, etc.),
  but this may be covered by appropriate unit tests in the GeoProcessing
  service itself.

At this stage, we should be able to run tests for the new component and see them
fail.

### Stub implementation

* consider whether a CRUD implementation is sufficient for the task
* if so, and if queries require JSON:API query features (filtering, sorting,
  sparse fieldsets, includes, pagination), we should base a new service on
  `AppBaseService`
* if the CQRS model may be more appropriate, there's still an option to go
  very lightweight on this by only keeping command and query DTOs fully distinct
* if CQRS proper is appropriate, it may be the way to go
* at this stage, we should aim for a breakdown of service functions that
  maximises the ability to meaningfully unit-test most functions (avoiding
  mixing computation and side effects, for example)

### Documentation

Add Swagger documentation where relevant, if not done before.

### Unit tests

These may be added before or after the actual implementation, as preferred.

### Actual implementation

Time to fill in the blanks

* actual db queries
* interaction with job queues
* computations/validations/etc.

It will probably be sensible to break down the implementation itself across
distinct PRs especially for larger features or where developers can focus on
distinct portions in parallel.

At this stage, we should see all tests pass.

### Edge cases

* add tests (e2e or unit as relevant) for edge cases that may emerge through
  use of the API, or for any bugs that we fix, to avoid regressions.

## Agile workflow

Please see the general [Vizzuality agile
framework](https://vizzuality.github.io/playbook/projects/agile-framework/) for
reference.

Additionally:

* we have a Jira-GitHub integration set up, so please make sure to use
  `MARXAN-NNN` labels in branch names and in PR titles; to keep track of where
  small items of work fit within larger stories, we should aim to always link
  branches and PRs to Jira stories/tasks

* if splitting up a story or task into smaller items, consider if it is
  meaningful to split the corresponding Jira story/task into subtasks; for very
  small subtasks this may be overkill, in which case please link branches/PRs to
  the main Jira story/task

* to try to keep cognitive overhead low for all the team members while
  collaborating on tasks/reviews, if the subtasks needed for a story/task are
  more than what could be easily mapped mentally by a drive-by colleague, please
  try to describe in the main Jira story how the pieces fit together, and any
  dependencies/blockers, either via a plain list with checkboxes, or through a
  sketch
