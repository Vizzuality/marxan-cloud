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

- streaming archive pieces from their cloud storage location when cloning the
  exported project/scenarios

- checking the integrity of all the pieces of a project and its scenarios as
  they are being used to create a clone of the original project/scenarios

- removing from cloud storage all the archive pieces once their validity expires

- garbage-collecting archive pieces that are not yet expired, if their source
  project or scenario is deleted

Moreover, _only when users request to be able to download a single zip file_
with all the contents of a project and any scenarios the following steps will
also apply:

- preparing a final archive file that includes all the finalized pieces

- storing the final archive

- allowing users to download the archive for a given project

- removing the archive once its validity expires

- allowing users to upload a zip archive to a MarxanCloud instance to get the
  archived project "rehydrated" as a new project on the target instance

- garbage-collecting archive zip artifacts that are not yet expired, if their
  source project or scenario is deleted
