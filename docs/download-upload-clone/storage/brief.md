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

In broad strokes, we need to account for the following steps. Details are
outlined in the [high-level design document](./high-level-design.md).

- storing one or more archive pieces as they are prepared and finalized

- preparing a final archive file that includes all the finalized pieces

- storing the final archive

- removing individual pieces

- allowing users to download the archive for a given project

- removing the archive and any related files once its validity expires

- allowing users to upload an archive to a MarxanCloud instance to get the
  archived project "rehydrated" as a new project on the target instance

- checking the integrity of an uploaded archive

- garbage-collecting archives that are not yet expired if their source project
  is deleted
