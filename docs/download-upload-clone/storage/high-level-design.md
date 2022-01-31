# Storage for MarxanCloud project archives - High-level design

Given the general points outlined in the relevant [brief document](./brief.md),
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
storage is cheap and - at the expected scale - likewise are data ingress and
egress.

Archive pieces are therefore stored uncompressed on blob storage.

Individual pieces exported as formats that are natively compressed (such as some
GIS file formats) will be stored as-is: therefore, with any native compression,
which will be handled transparently by the libraries or utilities (such as, for
example, `ogr2ogr`) used to process them.

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
must be aware of size constraints and halt their work with a relevant error if
available storage may not be sufficient to store a piece being prepared. This is
so that filesystem saturation and related error states may be avoided.

## Storage layout and metadata

<bucketUrl>/<organizationId>/<projectId>/<exportId>

The proposed URL schema is mainly meant to logically separate exports by parent
project and organization.

This may allow to easily isolate storage at different aggregation levels
(organization or even project), if desirable, at a later stage.

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

## Project export manifest files

Although some users may wish to edit project archives offline in order to tweak
some of the data/metadata while studying the project locally, MarxanCloud
instances will prevent importing archives whose content have been changed in any
way, in order to avoid data issues that may lead to importing projects in an
inconsistent state.

Integrity of archives being uploaded is enforced through a signed manifest file
that includes all the sha256 hashes of the individual pieces. This can be used
to verify the integrity of each piece, as well that all the required pieces are
present in the archive being uploaded.

In practice, however, since the actual _uploading_ of archives will not happen
from users' computers but rather directly from a signed URL of cloud storage
managed by the source Marxan Cloud instance (and to which users don't have
direct write access), user tampering should never be an issue.

Manifest files also include metadata such as content type and size in bytes of
each piece. This is used to provide users with a preview list of contents and
uncompressed size of each piece and of the whole set of pieces, in case local
storage space is a concern for users.
## Storage handling - flow for cloning

This section expands with design details the summary list provided in the [brief
document](./brief.md).

- storing one or more archive pieces as they are prepared and finalized

For anything else than small metadata files, these pieces should be streamed to
their eventual storage destination.

- streaming archive pieces from their cloud storage location when cloning the
  exported project/scenarios

When cloning an entire project or some of its scenarios, pieces are streamed
back from cloud storage to the MarxanCloud instance where a user has initiated a
cloning process.

- checking the integrity of all the pieces of a project and its scenarios as
  they are being used to create a clone of the original project/scenarios

See _Project export manifest files_ section above.

To check the integrity of exports, firstly the manifest of the exported project
is read from cloud storage. This includes a signed hash of all the pieces.

As individual pieces are streamed back for cloning (see previous step), their
hash is verified before their effects are persisted to database.

Whenever the hash of one single piece does not match what is provided in the
export manifest, or if the list of pieces cannot be verified as complete, the
entire import side of a cloning process, or the import of an exported zip
artifact, is stopped and any projects and scenarios imported that far will be
deleted.

- removing from cloud storage all the archive pieces once their validity expires

This is handled through blob tags (see Storage layout and metadata section
above).

Archives have a default validity configured as a platform setting. Once the
validity timespan of an archive has elapsed, all the pieces related to it are
deleted from cloud storage.

This is taken care of as a daily garbage collection process that goes through
all the recorded exports for each project. Any requests related to an export
will also result in its expiration timestamp being checked and deletion of its
pieces from cloud storage to be triggered.

In practice this may result in exported artifacts being physically available for
up to around 24hrs after their configured expiration timestamp. However, since
this timestamp is checked whenever the export is used (for example, if a user
tries to import it), no leakage of data beyond the configured expiration
timestamp should be allowed in any case, though the related storage space may
only be reclaimed with some delay.

- garbage-collecting archive pieces that are not yet expired, if their source
  project or scenario is deleted

Whenever a project or scenario is deleted, any exports that still have any
pieces in cloud storage will be garbage-collected.

## Storage handling - flow for downloadable zip artifacts

- preparing a final archive file that includes all the finalized pieces

Only when users request a downloadable zip file to be generated, this will
be prepared through a cloud function that reads all the relevant pieces from
cloud storage and generates a zip file that includes them all, alongside the
export manifest with signed list of included files and relevant checksums.

- storing the final archive

This would be available for download for a limited timeframe, typically
configured by the platform admins of each MarxanCloud instance.

- allowing users to download the archive for a given project

Users with suitable permissions on a project (see [relevant entries in the
MarxanCloud permissions
matrix](../../features/role-based-access-control/high-level-design.md)) must be
able to download the archive for a project, whether its creation was initiated
by themselves or by another user with access to the project.

These archives are generated upon request (see first step in this section):
therefore, users may need to check back on the application page that lists
available exports until this signals that the preparation of the archive has
been completed (see previous steps).

At this stage, users will be provided a signed download URL (Shared Access
Signature) with short temporal validity (configured in the application source
and ideally not to exceed 15 minutes) through which they can download the
generated zip file.

If the same user or other users subsequently with to download the same zip
archive again, only a new SAS URL will be generated for the same zip file.

- removing the archive once its validity expires

This is handled through blob tags (see Storage layout and metadata section
above, as well as the relevant step in the previous section: _flow for
cloning_).

- allowing users to upload an archive to a MarxanCloud instance to get the
  archived project "rehydrated" as a new project on the target instance

Whereas users may normally use the in-app "clone" feature to duplicate a project
and its scenarios, without having to download any archive artifacts, in some
cases they may choose to first download a copy of the final archive: for
example, for offline safeguarding/archiving, or to upload the archive to a
different MarxanCloud instance.

Uploading an export to the same or a different instance is handled in practice
_not_ by physically uploading the exported zip file from the user computer, but
by providing a signed URL for import.

The target instance will download the relevant artifact, uncompress and store
all the individual pieces in a temporary cloud storage location, and then
proceed to importing the individual pieces following the same cloning flow
outlined above.

- garbage-collecting archive zip artifacts that are not yet expired, if their
  source project or scenario is deleted

This step follows the same logic as the analogous step related to individual
export pieces described in the previous section.
