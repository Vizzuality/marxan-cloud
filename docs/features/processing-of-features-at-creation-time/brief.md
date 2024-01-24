# Processing of features at creation time - Brief

This document summarizes the rationale for the proposal of consolidating the
processing of features at feature creation time, rather than doing this as part
of the lifecycle of tuning each Marxan scenario.

This consolidation will be achieved through an update of the data processing
architecture and workflows that involve features within the MaPP platform.

With _processing of features_ here we mean:

- "quantization" of features across the planning grid, by calculating amounts
  per planning unit

This operation is currently done when users "save" the configuration of features
(set of features and their `prop` and `fpf` values) while setting up each
scenario within a project.

- splitting features by subsetting existing features within the project
  according to specific values of their attributes (if any)

Likewise, this operation is done when users "save" the configuration of features
within each scenario.

The scope of this update of the data processing architecture and workflows is
focused on the following kinds of features:

- features uploaded by users as shapefiles, within the scope of a project
- features obtained by splitting existing features, within the scope of a
  project
- features imported by platform administrators and made available to all the
  projects

Features uploaded as part of legacy projects as well as features uploaded via
CSV files with puvspr data are already imported as quantized sets. Nevertheless,
the changes outlined here will also affect these kinds of features, in order to
consolidate how different workflows operate.

In a way, through by moving the processing of features at creation time,
features uploaded from shapefiles and platform-wide features will be handled
in the same way as features from legacy projects or from puvspr data.

## Performance considerations

As the MaPP platform has been evolving through user adoption, development of new
features and improvement of existing ones since the public launch of its first
full version in 2022, a recurring point of friction in real-world use cases
has been the performance of geospatial operations.

Although users in most cases achieve the results they expect from the platform,
in some cases - especially where data from real or realistic planning projects
is used - they may need to patiently wait for some time while the platform's
components perform all the geospatial calculations and asynchronous processing
that are needed to prepare features and all the other aspects of the planning
grid for the Marxan solver.

## Outline of friction points from the point of view of user experience

In more detail, performance bottlenecks that mostly affect users in real use
scenarios were consolidated in the following business requirements:

- prevent calculation of features when not needed (that is, determining the
  amount of each feature per planning unit)

In the first version of the MaPP platform, some caching was introduced in order
to not have to perform spatial intersections every time a user fine-tunes a
scenario _by only changing "tabular" data such as `prop` and `fpf`; however,
when adding features to a scenario or removing features from it, some geospatial
processing is still necessary.

- prevent geospatial calculations when protected areas are changed

Since the MaPP gap analysis relies on spatial intersection of the union of all
the geometries that make up each feature with the union of all the geometries of
all the protected areas considered for a given scenario, changing the set of
protected areas considered will require new spatial calculations.

- allow users to control when to run the gap analysis by entering the relevant
  section and not running it automatically every time features or protected
  areas are added or edited

This requirement basically combines the user experience of the previous two: the
first version of the MaPP platform would require triggering calculations
whenever the configuration of features and protected areas is changed.

Some form of "delayed calculation" was considered during the development phase
of the first version of the MaPP platform; however its implementation was
eventually discarded, as this would have required to keep track of which parts
of a project's or scenario's data were up to date and which would require some
form of "refresh"/recalculation, which would introduce some extra complexity
and potential for data and its presentation to the user to be "out of sync".

- add the option to cancel long-running geospatial processing and other
  long-running processes/calculations, so that users doesn't have to wait until
  these are finished before they can carry out other changes to a project or
  scenario

This is a usability requirement that should help to avoid leaving users waiting
for calculations that will be obsolete once they further fine-tune a project or
scenario.

Ideally, users would only need to wait for a very short time as they go through
fine-tuning of conservation problems as far as these don't require new spatial
calculations.

- ability for users to split features at project level, making split features
  full features in their own right

This requirement is both a user ergonomics enhancement (avoiding to repeat
splits for each scenario where these are needed) and a performance enhancement,
as the geospatial operations needed to obtain features by splitting other
features would be done only once for each split feature.

Additionally, making split features full features in the own right, rather than
simply a logical subset of the original features they are split off would
simplify handling features overall throughout the platform, since we would
remove one of the "special cases" that the MaPP codebase currently needs to
handle, for each operation that involves handling features.

## Different handling of features according to the way they are imported into the platform

As features can now be imported through a multiplicity of routes, the
peculiarities of these import routes impose a complexity tax that makes the
system as a whole more brittle, less open to adaptation and harder to reason
about and fix if/when users run into bugs or unexpected behaviour.

Features can be imported:

- one at a time from shapefiles (the initial implementation)

For these features, the `amount` reported to the Marxan solver is basically the
area (in m^2 or km^2) of the intersection between the union of the feature's
geometries and each planning unit.

- as part of "legacy" projects

For these features, no "raw" spatial data is available and only the numeric
`amount` of each feature within each planning unit is available, as provided by
users. No measurement unit for these amounts is available either: however,
the measurement unit for the amount of feature per planning unit is assumed to
be consistent _within each feature_.

The "real" spatial extent and density distribution of each feature is unknown:
essentially, features are "quantized" across the planning grid: each planning
unit becomes the basic quantum of information for feature distribution across
space.

- many at a time, from puvspr data

Features imported through this route are substantially similar to features
imported from "legacy" projects: only the numeric `amount` of each feature
within each planning unit is provided by users.

As for features that are part of legacy projects, information is quantized
across the planning grid.

## Aim of the proposed changes

With the proposed changes outlined in the first section of this document,
computation-intensive processing of features will be done only once when
a feature is created/imported into the platform.

This will make the upload step of features somewhat slower (for features
imported from shapefiles), while avoiding altogether all the
computation-intensive operations when working on conservation scenarios.

With this necessary tradeoff in mind, the expectation is that users will be able
to keep flowing through the steps of the MaPP conservation planning user
experience, once they have prepared/imported all the features they will need for
their projects.

Consolidating the way different routes for importing features work behind the
scenes is expected to reduce the complexity of the current codebase, as well as
making it easier to fix bugs and to extend the platform's functionality in the
future.
