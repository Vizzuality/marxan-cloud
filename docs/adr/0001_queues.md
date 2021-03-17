# [API and Data engineering] Queues - for events, audit, messages, jobs...

* Date: 17 March 2021
* Status: decided
* Deciders: Alicia Arenzana, Andrea Rota

## Context and problem statement

Queues are a fairly ubiquitous strategy for several kinds of tasks and concerns
typically handled in backend operations.

As we make progress in the development of the platform, we started identifying
several kinds of queue systems which may be useful for the Marxan Cloud
platform; in this ADR we focus on articulating the kinds of systems and
potential candidates for implementation.

We would like to identify a sensible balance between implementation complexity
and ability to handle efficiently the most common operations that require queues
in the Marxan Cloud platform.

We identified four main scenarios where queue systems may be useful:

### Event queues

Recording what happened (kind + version), to whom (subject), when (timestamp),
done by whom (actor). Actors may be users or systems/events.

Depending on kind + version, events may be persisted indefinitely, within a
desirable retention schedule, or deleted once a task has completed.

This could be used for some lightweight event sourcing. For example, with
appropriate indexes and projections, we could record who changed an entity and
when separately from the entity itself and then use the latest recorded change
event to expose to API consumers who last changed an item and when.

### Audit queues

Gathering a potentially append-only log of audit events fired any time anything
relevant was done or changed by an actor (whether a user or a system/event). We
consider this kind of queue to be of somewhat lower priority initially.

These queues can potentially grow very large, so the ability to easily archive
past data (and potentially restore it) would be desirable.

### Message queues

Pub/Sub-style queues, handling the complexities of asynchronous communication
between loosely coupled actors (e.g. exactly-once delivery, dead letter topics,
etc.)

### Job queues

Central to most ETL, geoprocessing and computation tasks in Marxan Cloud. These
handle job orders and status updates for async, potentially long-running jobs.

Project engineers are familiar with orchestrating job queues with Airflow.

These queues may partially overlap or interact with event queues: events could
be used to create orders and record status updates. stdout/stderr should also be
streamed to appropriate sinks.

## Decision drivers

* we should try to minimise number, complexity and interdependence of additional
  components needed to handle queues

* conceptual simplicity (all else being equal, e.g. having all the features
  needed to fulfill our requirements)

* operational simplicity (all else being equal, as above)

* preference for existing FLOSS solutions especially when dealing with a complex
  use case (i.e. no need to feed any hybris by going NIH on something that is
  way bigger than our capacity)

* familiarity of the engineering team with potential solutions

* avoidance of programming language/framework proliferation

## Considered options

### Event queues

* A minimalist PostgreSQL-based queue system; we can adapt one from earlier
  projects, with a basic set of fields to record subjects/actors/timestamps and
  data.

* Redis.

### Audit queues

* Piggyback on an event queue, dealing with audit events separately. Archive to
  blob storage.

* Logging and audit logging functionality of the cloud platform.

Only for live instances; may require a different wiring to stream events from
development instances.

* Persist to Redis; archive to blob storage.

### Message queues

These may not be needed. Potentially Redis with BullMQ (there is an integration
for NestJS), if we ever do need.

### Job queues

* Apache Airflow.

* Redis. Direct interface or via the API.

* Redis with BullMQ, via the NestJS integration for this.

* graphile/worker (https://github.com/graphile/worker)

* Piggyback on an event queue.

## Decision outcome

Since the initial draft of this ADR (10 March 2021), we have validated the use
of Redis+BullMQ for job queues with a first worker written in TypeScript; and we
have likewise validated a simple PostgreSQL-based event queue module
(`ApiEventsModule`) adapted from an earlier NestJS project (simplified, and with
addition of optional typing on event payload).

These proof of concept gave us enough confidence about a sensible balance
between the functionality we need and minimal operational costs and cognitive
overhead.

### Event queues

We will be using the PostgreSQL-based `ApiEventsModule` for API events linked to
data structures we already handle in PostgreSQL, and for event sourcing use
cases.

### Audit queues

We will revisit this if/when we implement audit queues.

### Message queues

We will revisit this if/when we implement message queues. Redis+BullMQ seems an
optimal candidate since we are already going to be using this for job queues
(see below).

### Job queues

We will use Redis + BullMQ.

We are still evaluating whether it will be advisable to stick to this same setup
for non-TypeScript workers. We will work on a first PoC of the Marxan worker
using this setup, and reassess then.

For ETL pipelines where non-linear DAGs may be needed, we will consider Apache
Airflow as optimal candidate for first PoCs, given its extensive support for
complex DAG runs, combined with our team's existing engineering expertise with
Airflow.

## References

https://dev.to/kspeakman/event-storage-in-postgres-4dk2
https://thehardcoded.blog/event-sourcing-with-nestjs
https://stackoverflow.com/questions/60610383/nestjs-event-sourcing-event-persistence