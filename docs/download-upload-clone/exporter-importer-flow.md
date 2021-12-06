# Exporting / Importing clone pieces

## Context and problem statement

Exporting project, scenario or any underlying piece requires different 
resources and output, which may include creating archives, uploading files, 
getting huge amount of data from database, creating shapefiles and so on.

Main decision to be taken is whether this should happen within current 
context (of API) or be pushed as asynchronous task.

## Decision drivers

- performance
- flexibility
- delivery speed

## Considered options

### Solution 1

API

#### Pros:

- easier to implement the processors themselves

#### Cons:

- if something cannot be done as streaming (this is, unlike streaming data 
  from db), may block IO thread, and thus the API
- if the task is CPU/memory heavy, it is harder to scale
- requires to consider limit at processing in parallel

### Solution 2

Queues/Jobs

#### Pros:

- easier to scale (add nodes) which would only take care of processing the jobs
- ability to flexible set up the jobs processing throughput by configuring 
  queues capabilities

#### Cons:

- requires a bit more infrastructure

## Decision outcome

Solution 2

### Positive Consequences

* Keeping current architecture around asynchronous jobs
* Building with scale in mind (responsible module should be self-sufficient 
  and only rely on files space, which anyway may be an integral part of it)

### Negative Consequences

* more boilerplate around handling queues/jobs

## References

NA
