# Implementation conventions for typical API tasks

This document outlines a list of tasks to take into account when creating new
backend functionality, or when updating existing functionality.

It is meant to complement the high-level [API - development
workflow](./README_API_development_workflow.md) document, focusing instead on
specific implementation options rather than on the overall process.

Each of the following sections focuses on implementation subtasks that are
likely to be relevant for most backend features.

Details in this document are meant to help with background knowledge about
things to take into account when estimating and implementing new features or
changes to existing features, as guidance and checklist while working on
implementation, and while reviewing pull requests that need any of the
topics in this document to be taken into account.

As always, there may be occasions where a different implementation may be
required (for example, to avoid an expensive refactoring of an earlier
implementation that predates the practices outlined in this document, or because
of performance reasons, etc.). In these cases, it is essential to add a brief
comment in the source code explaining why the implementation differs from these
shared common practices within the codebase, as a courtesy for future readers of
these parts of code, to whom it may not be immediately clear why things were not
done in stricter alignment with common practices.

## JSON:API for queries and responses

TL;DR When adding new functionality or changing existing functionality that
involves CRUD-ish entities, use `nestjs-base-service` as uniform framework for
query and response compliance with JSON:API conventions.

Throughout the API surface, we rely on JSON:API conventions ([version
1.0](https://jsonapi.org/format/1.0/), as this was the current version when the
Marxan Cloud project was started) for most of the `GET` queries related to the
`R` part of CRUD-ish interfaces.

Most of the querying logic (sparse fieldsets, sorting, pagination, filering) is
typically handled via
[`nestjs-base-service`](https://www.npmjs.com/package/nestjs-base-service),
which provides a baseline set of primitives to type (in a TypeScript sense) and
handle requests via the `@ProcessFetchSpecification` decorator applied to the
request's `query`.

Likewise, `nestjs-base-service` provides primitives to configure and perform
serialization of responses in compliance with the JSON:API response format.

The Marxan Cloud frontend application will expect to be able to express `GET`
queries following the relevant JSON:API conventions, and to receive most
payloads related to CRUD-ish flows in the JSON:API response format.

When dealing with non-CRUD-ish flows where the `nestjs-base-service` machinery
may not make sense, query and response should be agreed as needed between
frontend and backend developers.

## Access control

TL;DR For every endpoint we should ensure that appropriate access control checks
are performed as part of the request lifecycle, within the endpoint's entry
point function in the relevant service.

With the exception of very few endpoints, mostly related to the "Community"
section of the platform and published projects listed therein, most of the
Marxan API endpoints require a valid JWT token obtained through an
authentication step, _as well as_ implementing some form of authorization.

Details of authorization and access control are outlined in the [Architecture -
Access control](./ARCHITECTURE_access-control.md) document. This in turn
references the project's [RBAC
documentation](./features/role-based-access-control/brief.md).

When implementing new functionality, it is essential to check that the user
performing a request has all the relevant permissions for the task at hand.

These checks will typically use the RBAC machinery referenced above, and will be
done as part of the checks done in the service function called from the
controller handler that exposes the functionality to API consumers.

## Tests for access control - focus on denied actions

TL;DR For every new endpoint, we should add tests to an e2e test suite, separate
from the one(s) that exercise the endpoint-related _functionality_, to make sure
that users with no suitable permissions are indeed prevented from carrying out
actions that require specific permissions.

Any new or updated functionality exposed through API endpoints should be
accompanied by e2e tests that support the development team's confidence in
the correct handling of permissions.

In practice, most e2e tests will be instrumented so that users with suitable
permissions are created as part of the test setup: this will help to make sure
that users who _should_ be able to carry out specific actions _will_ indeed be
able to do so.

On the other hand, what _tests specifically focused on access control_ need to
assert is the opposite - that users should not be able to access functionality
outside of what their roles on projects grant them: it is not necessary to
repeat "happy access control path" assertions that are already included in e2e
tests that require suitable permissions.

In most cases, we want to keep a sibling test suite to the main one that
exercises a specific subset of functionality, in a separate file, focusing only
on asserting that users without suitable permissions cannot carry out specific
actions (for example, that a reader user cannot edit an specific aspect of a
project, or grant roles, or that users without any role on a project cannot view
nor edit any aspects of a project, and so on).

## Tests - handling subsets of tests

TL;DR When adding new test suites, we should make sure that they are correctly
picked up by the GitHub Actions workflow matrix.

Through the refactoring of the test execution workflow in GitHub Actions (spring
2023), backend tests both for API and geoprocessing services are split into
small subsets, each of which is run as a fully independent job through the use
of a matrix strategy in the relevant GitHub Actions workflow file.

This subsetting is handled by matching specific subfolders of the
`api/apps/api/test` and `api/apps/geoprocessing/test` folders via a regexp match
with the part of path configured in the matrix list in the relevant GitHub
Actions workflow.

In practice, most of the subsetting is done by matching _immediate_ subfolders
of the base test folders mentioned above, although it is possible to include `/`
characters in the path, to further break down into individual jobs immediate
subfolders of the base test folders that contain several test suites/many tests.

As such, when adding new test suites as files in new subfolders of the base test
folders, we should update the matrix in the relevant GitHub Actions workflow to
make sure all the new suites/folders are picked up.

(In the future this may - and should - be covered by an automatic check: see
[MRXN23-207](https://vizzuality.atlassian.net/browse/MRXN23-207)) for the status
of this)

## Thin controllers

TL;DR Controllers should only dispatch requests to domain logic and then either
map domain errors to HTTP error responses, or return or stream results to
clients.

For most API endpoints, controller handlers should normally be kept _thin_:

- a single function call to a functionality entrypoint in the relevant service
  class, returning an `Either` type with either an error or a result
- error handling via `mapAclDomainToHttpError()` (see [Central error
  handling](#central-error-handling) section below)
- if the result of the first step is a stream, either piping it into the
  `Response`, or letting NestJS do this via its
  [`StreamableFile`](https://docs.nestjs.com/techniques/streaming-files#streamable-file-class)
  functionality.

## Central error handling

TL;DR Handle errors via `Left`s in `Either` constructs, and map domain errors
to HTTP error responses via `mapAclDomainToHttpError()`.

Expected errors are handled in a variety of ways through the backend services;
through time we've been converging on handling these through the use of the
`Either` construct (specifically, via the [`fp-ts`
library](https://gcanti.github.io/fp-ts/modules/Either.ts.html)).

API call stacks should propagate results as `Right` or errors as `Left` down
to the entrypoint to any functionality exposed to controller handlers.

In controller handlers, we typically handle errors through the
`mapAclDomainToHttpError()` function, which is basically a central point of
mapping of domain-specific errors to relevant instances of `HttpException`
optionally with an informative error messages.

These `HttpExceptions` are eventually thrown as a last error-handling step in
controller handlers, typically resulting in 4xx or 5xx HTTP response with
optional error information for API clients.

Special care should be taken when adding or changing mappings of domain to HTTP
errors in `mapAclDomainToHttpError()`, making sure that we only reuse existing
`Left` errors if these are equally relevant in the context(s) where they have
been using so far _and_ in any new context being introduced with new or changed
functionality. Otherwise, it may help to make existing errors more specific and
to differentiate new errors.

As a rule of thumb, if the same HTTP status code _and_ informative error
messages would apply, we should reuse an existing `Left` error, otherwise we
should create a new one (and either leave the existing ones as they are, or make
them more specific).

## Meaningful error messages

TL;DR Make all error messages meaningful, keeping in mind whether they are
intended for end users or for engineers/devops.

Related to the previous sections, when we compose error messages, these should
be as informative as possible.

- If an error message is meant to be exposed to API consumers (for example, the
  optional error messages that can be associated to `HttpError` instances via
  `mapAclDomainToHttpError()`), these should be end-user-meaningful.

A litmus test for this should be: if the frontend app would be displaying an
error message prepared in the API verbatim to end users, would this be clear to
them and would it help them to recover from an error situation?

As such, technical jargon, abbreviations, acronyms, references to implementation
details as well as irrelevant information should be avoided.

Conversely, information such as project or scenario names, names of files
uploaded by the user, other domain-specific information and so on could be
included, if these would help the user understand what exactly went wrong and
how they could recover from the error situation.

- If an error message is meant to be informing engineers or devops about
  failures, for example to help triaging bugs, the error messages should include
  enough detail (for example, stack traces, object dumps, etc.) without carrying
  too much information, which may end up hiding the relevant bits

Ideally, both expected and unexpected errors (for example failures in upstream
modules or external services) should be sent to logs (so that a timestamped
trace of the error event is recorded), with the minimum meaningful information
to point to _where_ the failure occurred and possibly _why_.

More extensive details should be included in ApiEvents` of the `Failed` kind:
the intent here is that if an error occurs and is either shown to a user
(through the use of the `status` endpoint for projects) or logged, engineers
should be able to get from these signals to the corresponding API event, and the
`data` payload for this should allow them to figure out how to further
investigate what happened.

Generic or empty error information in API events of the `Failed` kind are
usually not of much use, besides having a trace of a process having failed at a
specific point in time.

## API Events

TL;DR For any task, except simple queries for pre-calculated information or
simple create/update/delete operations, use API events to create a coherent
trail of the status and eventual outcome of the task.

The `ApiEventsModule` in the API service is a versatile generic append-only
event log that is used throughout the application for a variety of purposes.

As several Marxan operations are handled asynchronously, API events can help to
keep a trail of information about these tasks: acknowledging the fact that
processing has started, potentially keeping track of progress (especially for
long-running tasks, for example progress of a Marxan solver run), and signaling
eventual success or failure.

When emitting API events, it may be useful to use a thin wrapper class that
can keep behaviour consistent as well as handle extra information to add to
the `data` property of API events.

All API events related to a single task should consistently use the same
`topic`. The use of a thin wrapper class suggested in the previous paragraph may
help with this too.

API events _can_ be used also from the geoprocessing service, by using the
relevant API endpoint in the API service, through a service token (instead of
username/password authentication).

## Asynchronous jobs

TL;DR Use BullMQ queues and jobs to enqueue and process long-running jobs
outside of the event loop, or jobs that need to be handled in the geoprocessing
service.

Most processing tasks that cannot be fulfilled almost instantly as part of a
"fast" request lifecycle (for example, <1 second as a general rule of thumb) are
handled through asynchronous jobs, irrespective of whether they are fully
handled in the API service or partly in the API service and partly in the
geoprocessing service.

Likewise for jobs that, even if they may be expected to consistently complete
quickly, require tools such as `ogr2ogr` that are only available in the
geoprocessing service: in these cases, part of the request needs to be handed
over to the geoprocessing service.

Either way, we use BullMQ, backed by a Redis instance, to enqueue asynchronous
jobs and get them to be picked up by a BullMQ worker.

Alongside the use of BullMQ queues and jobs, asynchronous jobs will still
require, in most cases, that API events are fired to trace their lifecycle,
from acceptance through to processing and eventual success or failure.

## Receipts for asynchronous jobs

TL;DR Use `AsyncJobDto` to shape responses that inform API clients that a
request will result in an asynchronous job being processed "behind the scenes",
so that they can poll for status updates.

When API clients submit a request that is processed through an asynchronous job,
the API will typically respond immediately, after doing any relevant validations
and RBAC checks on the request and enqueueing this for processing (see previous
section).

In these cases, API clients should receive and acknowledgement of the job having
been accepted, through the use of `AsyncJobDto`. This signals to API clients
that some part of the request may end up being processed asynchronously, so that
they know that they should check for status updates via the `status` endpoint
for projects (see [Status for asynchronous jobs](#status-for-asynchronous-jobs)
section below).

## Status for asynchronous jobs

TL;DR When adding new kinds of project or scenario level asynchronous jobs,
we should also update the relevant mapping of related API events to status
reports, either in the `ScenarioJobStatus` or `ProjectJobStatus` classes.

An essential part of the asynchronous jobs architecture is the ability to report
to API clients about the _status_ of asynchronous jobs.

In the current architecture, a single `status` endpoint at project level is used
for this, and responses obtained through this endpoint include status
information (started, % done, finished or failed, or other ad-hoc statuses
depending on the specific kind of job) for project-level jobs (for example,
creation of a project grid, or export of a project) and for each scenario within
the project (for example, Marxan solver running, or feature specification being
processed).

When creating new kinds of asynchronous jobs, whether at project or scenario
level, these should be added to the kinds known to the `status` reporting
service (`JobStatusService`, which in turn relies on `ScenarioJobStatus` and
`ProjectJobStatus`, where the actual querying of relevant data is performed).

Both `ScenarioJobStatus` and `ProjectJobStatus` rely on API events to report the
status of asynchronous jobs: therefore the general recommendations about
[conscientious use of API events](#api-events), [asynchronous
jobs](#asynchronous-jobs) and [meaningful error
messages](#meaningful-error-messages) should be taken into account while
considering how API events are eventually used to report on progress, success or
failure (and, importantly, reasons for failure).
