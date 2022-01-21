# Storage for MarxanCloud project archives - High-level design

Given the general points outlined in the relevant [Brief document](./brief.md),
this document highlights the high-level design of the storage flow for
MarxanCloud project archives.

## Key principles

- Always be streaming

As noted in the brief document, apart from small metadata pieces, core data will
typically be expected to take up in the range of gigabytes of storage space,
hence the need to efficiently stream these pieces, whether from db to blob
storage, from blob storage to any post-processing stage and back to blob
storage, from blob storage to user devices, etc.

- Uncompressed data

Whereas compressing pieces (e.g. via zip) may lead in most cases to significant
space savings, this does typically introduce computationally intensive steps
(compression/decompression) as well as making handling pieces, individually and
as sets/subsets, potentially more cumbersome.

Given the expected use cases (allowing users to share a project archive to be
then uploaded by themselves or others as a new project, either directly from
cloud storage or by first downloading it to their local computers), file size
savings may be important only to some extent: typically when users want to store
archives locally/offline; when sharing archives directly through their cloud
storage locations, file size savings may be practically irrelevant as blob
storage is cheap as well as - at the expected scale - data ingress and egress.

Preference should be given, instead, to file formats (such as GIS file formats)
that could be streamed while supporting native compression or other strategies
to limit file sizes to a minimum.

- Local vs remote storage

In order to keep setup complexity low for development environments, the default
architecture for these will use local block storage, similarly to what is done
for temporary storage of shapefiles uploaded by users.

Staging/production/demo instances, on the other hand, will normally use cloud
blob storage (Azure Blob Storage) for performance reasons.

Whether local or remote/cloud storage is used, the backend code will use a
single storage interface, configured to work with suitable implementations
through instance config.

## Production - cloud storage

Azure Blob Storage is used to stream and store individual archive pieces.

While archives are being created, pieces are stored privately, i.e. only the
service account configured to allow the MarxanCloud backend to interact with
Azure storage will have access to the relevant blobs.

Each MarxanCloud instance makes use of a unique Azure storage account and
related service account.

Isolating tenants at the organization level may be desirable at a later stage
for security, compliance (e.g. choice of Azure region) and billing reasons.

When users request to actually download a complete archive, signed URLs are
generated using Azure Shared Access Signature (SAS). These are nevertheless
provided via redirection from local (API) URLs so that the eventual storage is
transparent to the end user.

## Development - local storage

Local block volumes are used, transparently, as backing storage in development
environments.

More stringent size limits will apply, therefore project archive piece resolvers
must be aware of size constraint and halt their work with a relevant error if
available storage may not be sufficient to store a piece being prepared. This is
so that filesystem saturation and related error states may be avoided.

## Storage layout and metadata

<bucketUrl>/<organizationId>/<projectId>/<exportId>

The proposed URL schema is mainly meant to logically separate exports by parent
project and organization.

Blob lifecycle (for example, deleting exports at their expiration timestamp, or
when their parent project is deleted from a MarxanCloud instance) should be
managed through Azure blob tags.

The files corresponding to pieces and final archive for each export should be
tagged with:

- `organizationId`
- `projectId`
- `scenarioId` (for scenario pieces)
- `exportId`
- `exportTimestamp` (timestamp indicating when the export was initiated;
  identical for all pieces)
- `expiryTimestamp` (used to programmatically remove expired exports and their
  pieces)

## Storage handling - flow

This section expands with design details the summary list provided in the brief
document.


- storing one or more archive pieces as they are prepared and finalized

For anything else than small metadata files, these pieces should be streamed to
their eventual storage destination.

- preparing a final archive file that includes all the finalized pieces

This would typically be a zip (ZIP64) file. It may also be advisable to keep all
the archive files alone and distribute them as a downloadable set of individual
pieces instead, in order to avoid typical user challenges while handling very
large files (e.g. > 4GiB) on personal computers.

- storing the final archive

This would be available for download for a limited timeframe, typically
configured by the platform admins of each MarxanCloud instance.

- removing individual pieces

This may be needed if pieces are eventually included in a single downloadable
artifact. If ongoing engineering considerations lead to making the individual
pieces available for download, this step may not be necessary.

- allowing users to download the archive for a given project

Users with suitable permissions on a project (see [relevant entries in the
MarxanCloud permissions
matrix](../../features/role-based-access-control/high-level-design.md)) must be
able to download the archive for a project, whether its creation was initiated
by themselves or by another user with access to the project.

- removing the archive and any related files once its validity expires

This is handled through blob tags (see Storage layout and metadata section
above.)

- allowing users to upload an archive to a MarxanCloud instance to get the
  archived project "rehydrated" as a new project on the target instance

Whereas users may normally use the in-app "clone" feature to duplicate a project
and its scenarios, without having to download any archive artifacts, in some
cases they may choose to first download a copy of the final archive: for
example, for offline safeguarding/archiving, or to upload the archive to a
different MarxanCloud instance.

- checking the integrity of an uploaded archive

Although some users may wish to edit project archives offline in order to tweak
some of the data/metadata, MarxanCloud instances will prevent this by default in
order to avoid data issues that may lead to uploading projects in an
inconsistent state.

- garbage-collecting archives that are not yet expired if their source project
  is deleted

This is handled through blob tags (see Storage layout and metadata section
above.)
