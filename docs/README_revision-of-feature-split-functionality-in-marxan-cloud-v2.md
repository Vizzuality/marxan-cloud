# Revising how feature splits work in Marxan Cloud v2 - February 2024

This document outlines the changes needed in order to make the feature split
functionality work in the v2 release of Marxan Cloud, taking into account the
breaking change (introduced in the same v2 release) related to how feature
amounts per planning unit are stored alongside other spatial data, rather than
always computed on the fly when needed, via spatial intersection.

## Linking of split features to subsets of features_data

For each feature obtained via split, we need to store a list of unique
identifiers of the `(geodb)features_data` rows that match the subset of feature
identified by the K/V set for the split feature.

Although `(geodb)features_data.id` would be a natural candidate for these ids,
in practice this would complicate how we handle copying features over through
clones of projects, as we would need to update all the stored lists of matching
ids in each split feature we're copying over, to match the
`(geodb)features_data.id` generated on insert of the cloned parent features from
which splits were obtained.

We already do some kind of magic around similar predicaments throughout feature
exporters/importers (basically creating temporary ids on export, which we then
reference on import, sort of), but it may be much more effective (as well as
simpler) at this stage to assign a stable id to each `(geodb)features_data` row,
and then reference this from within the list of ids stored with each split
feature.

As for the linking of split features to `features_data`, this could be done via
a join table, but in this case it may be simpler to store this as an array of
ids within a single column in the `(apidb)features` table itself, not least
because the join-table alternative would not really provide any benefits from a
referential integrity point of view, since `features_data` is in geodb.

Exporting and importing features metadata would also be more complicated if
using a join table.

Whereas this plan is specifically for the split functionality, this linking of
features to features_data via arrays of stable ids could be done for _all_ the
features (plain ones, those obtained via splits, and those obtained via
stratification while this operation was enabled on any given instance): this
way, the same strategy can be used when querying features created in any of the
three possible ways listed above.

In the case of the current global platform-wide feature, this would mean storing
a very large array of ids in the feature metadata, because of the large number
of geometries/`features_data` rows for this specific feature. Likewise for
user-uploaded features with large number of geometries. This may be a fair
tradeoff, however, especially as it would apply to a very limited number of
features, while allowing to avoid the need to query `features_data` in different
ways depending on how a feature has been created.

## Updating existing data

DB migrations will be needed to set stable ids for existing `features_data` rows.

A self-standing script (such as previous Python ones created to update existing
data across apidb and geodb) will be needed to link existing split features to
the correct subsets of `features_data`.

### Creating stable ids for existing `features_data`

This could be a simple

```
update features_data set stable_id = id;
```

as we won't need to enforce any particular values at this stage when backporting
the new column on existing features. Making the column `not null default
gen_random_uuid()` would also work.

### Linking existing split features to `features_data`

Once the above step is done, we can run a migration to query the relevant stable
ids through the K/V pair which is stored as part of the feature, and then set
the array of relevant stable ids.

The script may use the same queries already used to calculate subsets within
`SplitOperation` (and `StratificationOperation`, if wanting to do this for
features that may be obtained via stratification as well).

## Updating the split operation

The main issue preventing the split operation from working correctly without the
changes outlined in this document is that `SplitOperation` gets passed the id of
the split feature for the step in which it tries to compute the amount per PU of
the split feature, but since no `features_data` geometries are ever linked to
any other feature than "parent" (i.e. whole, not split) features, then we end up
with no geometries (nor amount per planning unit, and hence not even any min/max
of amounts per PU).

So this needs to be changed to:

- firstly, query the subset of `features_data` that matches the K/V pair requested
- store the list of stable ids of these `features_data` rows alongside the
  feature being created
- use the list of `features_data` rows derived above, when calculating feature
  amounts per PU

## Updating piece exporters and importers

Piece exporters and importers will need to:

- export and import the new `(geodb)features_data.stable_id` column
- export and import the new `(apidb)feature_data_stable_ids` column

## Updating queries for tiles of features

These will need to use the list of relevant `features_data` rows as stored
alongside each feature.
