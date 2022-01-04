# Storage for MarxanCloud project archives

This document outlines the key points of the storage strategy for MarxanCloud
project archives: these are the downloadable artifacts that contain all the
relevant data and metadata for a MarxanCloud project and its scenarios, which
can subsequently be uploaded to a MarxanCloud instance in order to set up a
copy of the downloaded project.

## Project and scenario export and import flow - storage

The preparation of a MarxanCloud project archive (see main [brief
document](../brief.md)) is articulated through the preparation of several
"pieces", each storing a coherent part of the data and metadata that make up a
project or scenario.

Whereas some metadata pieces may take up only a few hundred bytes, core project
geo data may result in large pieces (in the GiB order of magnitude). Handling
such files efficiently is therefore a key requirement during preparation,
storage, download, upload and processing while creating a MarxanCloud project
from an uploaded archive.

In broad strokes, we need to account for:

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

- allowing users to download the archive for a given project

Users with suitable permissions on a project (see [relevant entries in the
MarxanCloud permissions
matrix](../../features/role-based-access-control/high-level-design.md)) must be
able to download the archive for a project, whether its creation was initiated
by themselves or by another user with access to the project.

- removing the archive and any related files once its validity expires

- allowing users to upload an archive to a MarxanCloud instance to get the
  archived project "rehydrated" as a new project on the target instance

Whereas users may normally use the in-app "clone" feature to duplicate a project
and its scenarios, without having to download any archive artifacts, in some
cases they may choose to first download a copy of the final archive: for
example, for offline safeguarding/archiving, or to upload the archive to a
different MarxanCloud instance.
