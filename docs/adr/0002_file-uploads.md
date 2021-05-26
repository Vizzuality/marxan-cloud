# [API and Data engineering] File uploads

* Date: 24 May 2021
* Status: proposed
* Deciders: Alicia Arenzana, Kamil Gajowy, Alex Larrañaga, Dominik Ostrowski,
  Andrea Rota

## Context and problem statement

We would like to define a general strategy for uploads of files through which
these could reach the service that will process them (most often the
*geoprocessing* service). The strategy should work reliably and with limited
complexity, and in a consistent way in every context where we handle uploads of
potentially large files.

Most of the times we will accept file uploads via an API endpoint as part of a
request which is then reverse-proxied to the geoprocessing service.

In some cases, however, we will want to actually trigger an async job via
message queue from the API rather than proxying the HTTP request to the
geoprocessing service: this is (at this time) because we can only push jobs on
BullMQ queues from the API. The geoprocessing service can currently only listen
for messages via BullMQ.

In this case, a strategy for getting uploaded files to the geoprocessing service
is required, as adding them as payload to BullMQ jobs can only work up to ~512MB
(given Redis size limits), and we do expect to need to handle uploaded files
larger than this.

## Decision drivers

* reliability: can we make sure we get files of arbitrary sizes (up to limits
  configured instance-wise) to the service that needs to process them, reliably
  signaling failure in case the file cannot reach the backend service it is
  meant for? existing/proven strategies/packages should be privileged over NIH
* simplicity: can we keep implementation complexity to a minimum, specifically
  avoiding incidental complexity that can affect both the implementation itself,
  the setup of the infrastructure needed to support it, and the ongoing
  maintenance of such infrastructure? fewer and simpler moving parts should be
  preferred, if suitable, over more and more complex parts
* performance: as we may need to accept files up to several GB in size, can we
  reliably transfer these with minimal overhead up to their eventual
  destination even for larger files? can unnecessary steps and copies of data be
  avoided? can files be used as streams?
* ergonomics: can the interface for uploads be easy to use from our own
  application code, all the above being equal? can the workflow be easy to use
  in a development environment? can the workflow be easily testable, if
  applicable?
* avoidance of vendor lock-in: the workflow should not depend on specific vendor
  solutions that cannot be easily swapped out for alternative
  solutions/implementations

## Considered options

* add queue push logic to geoprocessing service

In this setup, the API will act as a plain reverse proxy, and the receiving
endpoints in the geoprocessing service will need to write the received file(s)
to disk, process the other metadata of the HTTP request reverse-proxied from the
API, and create and push a job (for the geoprocessing service itself) to a
BullMQ queue.

Code can probably be shared rather easily (even through a plain make target that
uses `cp`, `rsync` or whatever applicable within the source tree when queues
code is updated in the API service); however this will cause duplication, mixing
of concerns, and will imply doing even more things in the geoprocessing service
besides its core geoprocessing duties.

* object storage

API validates and accepts REST request, uploads blob to an object storage
bucket, and pushes a job via BullMQ. Geoprocessing service retrieves job via
BullMQ, requests blob from object storage, writes it to local filesystem and
processes it.

This will require setting up development buckets and related users and ACLs on
Azure Blob Storage.

We should still use some form of local storage (maybe from the *shared volume*
strategy below) for local development, to avoid shuttling blobs around from
local dev env to an Azure data centre and back.

An adaptor may be useful for this, and also to avoid locking the setup to
specific cloud providers.

* shared volume

API validates and accepts REST request, writes blob to a local path which is
on a volume shared with the geoprocessing service, and pushes a job via BullMQ.

Geoprocessing service retrieves job via BullMQ, reads file from shared volume,
potentially writes it to temporary local (container) filesystem and processes
it.

Azure Kubernetes Service only supports `ReadWriteOnce` access mode for
Persistent Volumes (PVs) based on Azure disks
(https://docs.microsoft.com/en-us/azure/aks/azure-disks-dynamic-pv).

In practice, we have verified through a PoC that *within a single Kubernetes
node*, more than one pod can mount the same PV in read/write mode, and *at the
same time* more than one pod can mount the same PV in read-only mode. This does
not seem to be consistent with the Azure documentation.

To allow pods *scheduled over more than a single node* to share a common PV,
either PVs based on Azure Files would be needed, or a different strategy should
be considered.

In development environments, a shared Docker volume could be used.

Some form of cooperation between file producers and consumers will be needed,
as a form of locking between pods, in order to ensure that files are only read
once they have been full written to disk.

In its simplest form, this could be handled at the application level, ensuring
that the file is fully written to disk and that filesystem caches are fully
flushed, before placing the job that would use the file on a BullMQ queue.

Alternatively, some form of hashing could be used, though this will increase
the (disk I/O and computational) cost of these file operations.

* HTTP (push)

API validates and accepts REST request, then forwards the file (files? it's
probably a good idea to consider from the outset multi-file uploads) in the
request via a new request *to a generic file uploads endpoint on the
geoprocessing service*, whose only job is to accept file uploads (irrespective
of their purpose and of which component within the service itself is going to
process them).

Geoprocessing service accepts the file and writes it to temporary local storage,
following a path schema that includes a unique id that can then be used to link
back the file(s) to the job that should process them.

API service pushes a job via BullMQ, with a unique id matching the one sent
alongside the file(s) in the previous step.

This setup would need some kind of garbage collection to make sure that files
accepted by the geoprocessing service but not followed by a job (because of any
errors or timeouts or other issues) are eventually deleted from temporary
storage on the geoprocessing service.

It also requires to check that a file has been written to disk fully in the
geoprocessing service before any code that operates on it tries to use it (this
should be possible with advisory file locks).

This setup may not be suitable for Kubernetes deployments of the Geoprocessing
service scheduled over more than a single replica, unless by ensuring that the
file is pushed to all the pods in the deployment (which would be at best
wasteful and likely brittle).

* HTTP (push after event)

As above, but the API will only push files to the geoprocessing service after
receiving an `ApiEvent` from the job in the geoprocessing that picks up the
job request.

The same limitations noted above for horizontal scalability of deployments
apply.

* HTTP (pull)

API validates and accepts REST request, writes file to temporary local storage
following a path schema that includes a unique id that can then be used to link
back the file(s) to the job that should process them, and pushes a job via
BullMQ.

Geoprocessing service retrieves job via BullMQ, requests file via HTTP from API
service, using a generic file downloads endpoint on the API service, whose only
job is to accept file download requests (irrespective of their purpose), writes
it to local filesystem and processes it.

This setup would need some kind of garbage collection to make sure that files
cached locally by the API service but not followed by `GET` request by a job on
the geoprocessing service (because of any errors or timeouts or other issues)
are eventually deleted from temporary storage on the API service.

Similar concerns as noted above regarding horizontal scalability of deployments
apply, unless using a combination of PV shared among all the API replicas and
HTTP (pull), but then just using a shared PV would be simpler.

* Syncthing (or similar)

It should work rather reliably, is available in Alpine (on top of which the
Marxan images for API and geoprocessing service are built), but would require a
new setup for its configuration and monitoring. And I have never seen it used
in this context.

## Decision outcome

### Positive Consequences

### Negative Consequences

## Pros and Cons of the Options

### [option 1]

## References

