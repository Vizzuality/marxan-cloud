# Data security - backups

This document outlines how Marxan data is protected against data loss through
backups.

There are two main pools of data that need to be secured:

- **Databases**

User, project and scenario data and metadata stored in the platform's two
databases (`apidb` and `geodb`).

- **MarxanCloud archives**, stored on the `shared-cloning-storage` dedicated
  Kubernetes shared volume

These archives are created whenever users either:

- publish a project: these archives are kept indefinitely or until a published
  project is "un-published" by its owners, and are used whenever users clone a
  published project into their own account - the new copy of the published
  project is "hydrated" from the relevant archive
- download the archive of a private project they have access to; the latest five
  such archives are kept indefinitely while older ones are routinely cleaned up
  from the underlying storage volumes

Besides the two pools of data above, temporary files created during routine
user operations (data uploads, etc.) are considered transient and as such are
not backed up.

The following sections provide more detail about how each pool of data is
protected via backups.

## Backups of data stored in databases

_Azure Database for PostgreSQL - Flexible Server_ instances (staging and
production) are protected via automatic daily backups with default settings
(https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-backup-restore).

## Backups of data on storage volumes used for project archives

This data is backed up to Azure blob storage container via Kubernetes cronjob
that employ the [Restic](https://restic.net) backup software.

In detail, the process configured via Terraform includes the following steps:

- one-off setup

  - the primary access key for the platform's Azure storage account is
    configured as a k8s secret in the `api` set of secrets
  - a blob storage container is created for staging and one for production (if
    production is enabled)
  - a Kubernetes cronjob is set up for each of staging and production
    - the cronjobs use the upstream [`restic/restic` container
      image](https://hub.docker.com/r/restic/restic), pinned at a specific
      current version
    - the cronjob is scheduled to execute _daily_, with start times for staging
      and production staggered by a few hours in order to minimize the chance of
      cronjobs for both environments to ever be running at the same time, which
      would increase CPU and memory pressure on the node pool that hosts both
      staging and production namespaces
    
- backup runs: on each execution, the cronjob will:
  - mount the `shared-cloning-storage` shared volume, read-only
  - configure Restic [via environment
    variables](https://restic.readthedocs.io/en/stable/040_backup.html?highlight=environment#environment-variables)
    to use as backup destination the relevant Azure blob storage container,
    authenticating via the access key retrieved from Kubernetes secrets
  - try to initialize a Restic backup repository on the relevant blob storage
    container: this would effectively be done on the first successful cronjob
    run ever for each environment, and then become a no-op as the initialization
    has happened already: the related error can be and is ignored
  - back up via Restic the cloning storage volume mount path as source, to the
    target storage container
  - instruct Restic to forget and prune snapshots that don't fall within the
    configured retention policy; this is initially configured as up to one year
    with daily snapshots decreasing to weekly after 60 days for production, up
    to 8 weeks with daily snapshots decreasing to weekly after 30 days

## Restoring data

Whenever a restore may be required, this will need to be handled manually and
according to the specific context (pool of data to be restored, as a whole or
subset of it, reason for restoring, etc.).

The Azure Database for PostgreSQL - Flexible Server service includes facilities
(via the `az` CLI tool or via the Azure web portal) to restore recent
point-in-time backups.

Data on storage volumes used for project archives will need to be manually
restored, for example by spinning up a temporary container that uses the
`restic/restic` container image, mounting the shared volume in read/write mode
and using Restic's CLI to recover any data needed, while making sure that the
API and Geoprocessing pods are not accepting connections in order to avoid
conflicting writes and reads to the shared volume.
