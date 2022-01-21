# Storage for MarxanCloud project archives - High-level design

Given the general points outlined in the relevant [Brief document](./brief.md),
this document highlights the high-level design of the storage flow for
MarxanCloud project archives.

## Local vs remote storage

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

## Storage structure

<bucket>/<organizationId>/<projectId>/<exportId>/<exp>

