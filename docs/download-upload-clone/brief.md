# Cloning Marxan Cloud projects and scenarios

This document describes the high-level overview of the Marxan Cloud platform
user features related to cloning of projects or scenarios.

## Aim

Users should be able to clone Marxan Cloud projects for a range of purposes:

- A user may see a community project (i.e. those that can be browsed without
  logging in to the platform) and wish to create a copy within their own
  account, to study it and modify their own copy

- A student being trained on Marxan may need to clone an existing project
  (whether public, from the community section, or a private project to which
  they have been given access by the project owner), in order to study the
  project and learn how to set up and run Marxan on the project

- A user may need to download one of their projects, in order to archive a copy
  that can be later imported into a different Marxan Cloud instance

- A user may need to set up a local instance of the open source Marxan Cloud
  platform, importing into it a copy of one or more projects previously
  downloaded from the flagship Marxan Cloud instance

Users should likewise be able to clone Marxan Cloud scenarios (within the same
project):

- Users may wish to undertake a new analysis by changing parameters of an
  existing scenario, while keeping the original (cloned) scenario intact, so
  that they can later compare the two scenarios.

# User actions

In all these use cases, the core operation being described is that of cloning a
project or a scenario: this may be done within the platform itself by clicking
on a “Clone project” or “Clone scenario” button, or (in the case of projects) as
a two-step process, first downloading an archive file containing all the data
needed to successively upload the same project to the same or another Marxan
Cloud instance, and secondly actually importing the archive.

The ability to download and upload an individual scenario may not provide
significant value to users, as this would make sense only within a specific
project: a scenario downloaded from a project cannot be uploaded within a
different project, even if the source and destination projects share exact same
planning grid, because of data constraints that would pose significant
implementation challenges. Cloning the parent project (which would include all
its scenarios) may be all that users need in this case.

Additionally, as a related use case which should nevertheless be significantly
different from a requirements and implementation point of view: Some users may
have Marxan input (.dat) files, planning unit shapefiles and features shapefiles
from analyses they may have run through qgis or other tools on their
workstation, and may wish to upload these “legacy” projects to a Marxan Cloud
instance

This operation (cloning) can be seen, essentially, as a way to create an exact 
replica of an existing project.

### From user perspective:

#### Scenarios:

* Only cloning is available.
* User will click on a "duplicate" button and the scenario will get duplicated
  on the same project without further interaction.

#### Project:

* Three possible actions: Clone, Export, Import
* Clone: User clicks on a button, the project gets duplicated in their account
  without further interaction.
* Export: User clicks on a button and gets a file.
* Import: User uploads a file to the platform and a project is created within
  their account.
