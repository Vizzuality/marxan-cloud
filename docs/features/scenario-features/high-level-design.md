# Processing of GeoFeatures

Design document for the processing of geofeatures for scenarios.

For context, please see a detailed [illustration of how split and stratification
operations are
handled](./README_geo-feature-processing/split-vs-stratification.pdf), and a
[sketch of how these map to the formal specification of these
operations](README_geo-feature-processing/stratification-example.png) described
below in this design document.

## Listing of features

Endpoint:

```
GET /api/v1/projects/:projectId/features
```

Through this endpoint, users *should be able to see* a list of features that
include:

* all "public" features in a given MarxanCloud instance

  These are features imported via the MarxanCloud ETL pipelines for IUCN Mammals
data, World Terrestrial Ecosystems data and other such datasets.

* all features uploaded by users while creating a scenario

  These features should be visible at the project level, and to all the users
  with a role (whether explicit or inherited) on the project. Therefore,
  features uploaded by a user while working on a scenario should be visible when
  working on other scenarios within the same project.

The two lists are merged and served through the unique endpoint above. Features
specific to a project will have a `projectId` property (matching the id of the
project as provided as parameter in the URL of the endpoint); "public" features
will have an undefined `projectId` property.

### Exclusions

Features created via splitting or stratification of other features while working
on a scenario should not be included in the list above.

### Payload

```
[
  {
    "type": "geo_features",
    "id": "ecc94b0f-41fa-43e6-80bc-e7300a1b9b38",
    "featureClassName": "iucn_acinonyxjubatus",
    "alias": "....",
    "description": "...",
    "tag": "species|bioregional",
    "creationStatus": "<job_status>",
    "attributes": {
      "featureClassName": "iucn_pantherapardus",
      "alias": "Bacon Sausages wireless Colon interfaces optical value-added Jewelery",
      "propertyName": "Oregon Danish Plastic approach Intranet Generic THX convergence",
      "tag": "species",
      "categories": [
        {
          "key": "Metal",
          "distinctValues": [
            "cross-platform content-based Optimization deposit programming to",
            "Metal client-server Club Program Bedfordshire pixel",
            "Plastic reboot management SCSI Analyst digital",
            "to e-tailers intranet firewall invoice invoice",
            "Account 24/365 compress back transition innovate",
            "multi-byte driver Planner Underpass Cape payment",
            "structure sensor asymmetric Turnpike synthesizing Profound",
            "Program indigo Forks Fantastic Account Buckinghamshire"
          ]
        },
        {
          "key": "Avon",
          "distinctValues": [
            "calculate Islands IB Principal calculate Forward",
            "bypassing Money solution sky Vista Wooden",
            "Shoes Keyboard cross-platform Lebanese Personal 1080p",
            "Administrator magenta Turkish Baby Global Greece",
            "reinvent Light Legacy object-oriented Chair Estate",
            "Tasty functionalities engage Cambridgeshire withdrawal Supervisor",
            "Rustic South New Down-sized invoice known",
            "utilisation Shoes Generic Chicken Human 4th"
          ]
        }
      ]
    }
  }
]
```

## Definition of features

Splitting and stratification of features is only *planned* during the definition
of the list of features to be included in a scenario: we can think about this as
a sort of "recipe" (specification) for the definition of all the operations
needed to select, subset and intersect features, leading to the actual features
eventually being linked to the scenario.

The `status` property (see below) of feature specifications can only be set to
two values:

- `draft`, in which case the specification is only validated and - if valid -
  stored alongside the scenario, or
- `created`, in which case actual computation of desired features is carried out
  and these are eventually linked to a scenario; if features were already linked
  to the scenario through a previously-submitted specification, these will be
  unliked before the newly-calculated ones are linked to the scenario (in an
  atomic transaction)

Given the idempotence note above, once a specification's status has been set to
`created`:

- if the specification is submitted again with status `draft`, any already
  existing features will be left intact and linked to the scenario; the
  specification will be validated and persisted alongside the scenario
- if the specification is submitted again with status `created`, resulting
  features will be computed again, any existing features linked to the scenario
  will be unlinked from it, and the newly calculated features will be linked to
  it

[TBD]: If a specification is submitted with status `created` while the effects
of a previous submission with status `created` are still being computed (or are
queued to be computed), the new submission can either be rejected (this requires
checking for previous jobs that are neither completed nor failed) or it can be
queued, although without guarantees on the order of processing of asynchronous
jobs this could lead to inconsistent state.

### Selection of features: plain or via geoprocessing operations

Given the list of features available to users while configuring a scenario (see
section above), users can:

* select individual features for inclusion

* for `bioregional` type features, split them by selecting a property and the
  unique/distinct values of the property for which new features should be
  created

  For example, given a terrestrial ecoregions dataset, split into two subsets:

  * HabitatType = "Deserts and Xeric Shrublands"
  * HabitatType = "Flooded Grasslands and Savannas"

  Names of the resulting subsets are generated from the value of the property
  against which the split is performed.

  In the example above, the names of the two new features will be "Deserts and
  Xeric Shrublands" and "Flooded Grasslands and Savannas", respectively.

* for `species` type features, intersect them with either one `bioregional` type
  feature at a time, or with subset of a `bioregional` type feature by splitting
  this as outlined in the previous point

  For example, given a feature with the habitats of Cheetas, intersect this with
  the two subsets in the split operation outlined above, resulting in two
  features:

  * Cheetas / Deserts and Xeric Shrublands
  * Cheetas / Flooded Grasslands and Savannas

  Names of the resulting subsets are generated via a template:

  `${species_feature_name} / ${bioregional_feature_name}`


### Defining the set of features for a scenario

To create or update the specification of the set of features for a scenario:

```
POST|PUT `/api/v1/scenarios/{sid}/features/specification`
```

We only support `POST` and `PUT`: the API always expects the full specification.

Handling `PATCH` requests would significantly increase implementation complexity
with arguably little benefit.

`POST` and `PUT` are considered equivalent when creating or updating a
specification, and in practice `PUT` can _always_ be used since an empty
specification is assumed to be linked to each scenario until a user-configured
specification is actually submitted and linked to it.

Processing a specification of the set of features for a scenario should be an
idempotent operation; moreover, geoprocessing operations are only executed once
a specification is marked as `created` (as a transition from the initial default
state of `draft`), and the computationally expensive parts of these operations
only happening once: i.e. if the results of a given split or intersection
operation have been computed already for other scenarios, these
already-calculated results will be used.

This will allow timing side-channel attacks. If avoiding to disclose that a
specific feature has been already calculated for a given area in some scenario
in a given MarxanCloud instance is desirable, suitable countermeasures should be
implemented (such as always performing geoprocessing operations in their
entirety even if resulting geometries are available, or reusing geometries while
computing throwaway results in order to simulate constant-time operations).

#### Payload

`CreateGeoFeatureSetDTO` or `UpdateGeoFeatureSetDTO`

```typescript
{
  status: 'draft' | 'created'
  features: [
    {
      featureId: string;

      geoprocessingOperations: [
        /**
         * At most *one* operation: either one operation of kind `split/v1` or
         * one operation of kind `stratification/v1`, or one operation of kind
         * `copy/v1`.
         */
        {
          kind: 'split/v1',
          splitByProperty: string,
          splits: [
            {
              value: string,

              marxanSettings: {
                prop: number,
                fpf: number,
              }
            }
          ]
        },
        {
          kind: 'stratification/v1',
          intersectWith: {
            featureId: string,
          },
          splitByProperty: string,
          splits: [
            {
              value: string,

              marxanSettings: {
                prop: number,
                fpf: number,
              }
            }
          ]
        },
        /**
         * This could replace the previous different treatment of `plain` and
         * `withGeoprocessing` features: *all* features will be "geoprocessed",
         * and the `kind = 'copy/v1'` will be a plain selection/pick of an
         * existing feature, associating `marxanSettings` to it.
         */
        {
          kind: 'copy/v1',
          marxanSettings: {
            prop: number,
            fpf: number,
          }
        }
      ]
    }
  ],
};
```

#### Flow for the definition/confirmation of feature specifications

For the sake of simplicity, we assume a recipe will be created as `draft`
initially.

The intent here is not to describe all the possible flow paths but the key
points, so this simplification will not affect the description of the process.

* Specification is created (`POST`) with `status: 'draft'`

  * for each feature

    * check that `featureId` matches an existing feature `(apidb)features.id`:
      if not, throw an error

    * check that for the feature referenced, `projectId` is either `null` or
      matches the `id` of the parent project of the scenario

    * validate the `geoprocessingOperations` part of the feature's specification

      * `geoprocessingOperations` is defined as an array to accommodate possible
        future sequential operations, but for the time being it is limited to
        one operation only (so the length of the array can be at most 1)

      * moreover, each specification is meant to be processed in a single pass,
        so no geoprocessing operations should depend on the result of other
        geoprocessing operations within the same specification

      * all features *referenced* in a specification must be "plain" features,
        that is, not the result of a geoprocessing operation, such as a
        split/subsetting, already performed in the platform as part of the same
        project

      * both platform-wide (that is, imported by the administrators of an
        instance via ETL pipelines) and user-uploaded features can be
        referenced, although only features uploaded within the current project
        are available as usable within a specification

      * check that all the traits of the geoprocessing operations are valid
        (properties exist, intersected feature exists, etc.)

      * if validation fails, throw an error

  * persist the recipe as JSONB (this will reduce it to canonical form), linked
    to the parent scenario, and fetching the canonicalized form via `RETURNING`

  * send the canonicalized recipe as response

* Recipe is replaced (`PUT`) with `status: 'draft'`

Identical flow as above.

* Recipe is replaced (`PUT`) with `status: 'created'`

  * as above for each feature (checks)

  * as above for persistence in canonical form

  * for each `withGeoprocessing` feature

    * extract recipe for the *resulting* feature (basically discard *other
      splits* than the current one and `marxanSettings` data for the resulting
      features); see example below for a `stratification/v1` operation:
      `split/v1` will be almost identical, but without the `intersectWith`
      property

```typescript
{
  featureId: string;
  geoprocessingOperations: [
    {
      kind: 'stratification/v1';
      intersectWith: {
        featureId: string;
      },
      splitByProperty: string,
      splits: [
        {
          value: string,
        }
      ]
    }
  ]
}
```

    * persist the extracted recipe in `scenario_features`:

```sql
create table scenario_features(
  id uuid not null default gen_random_uuid(),
  scenario_id uuid not null references scenarios(id) on update cascade on delete cascade,
  -- feature_data_ids will be null if the feature from this recipe hasn't been calculated yet;
  -- each id maps to the ids of the `geodb.scenario_features_data` which match
  -- the 
  feature_data_ids uuid[] null,
  geoprocessing_ops jsonb not null,
  geoprocessing_ops_hash text generated always as (digest(geoprocessing_ops::text, 'sha256')) stored,
  name text, -- e.g. "<Species> / <ecoregion>" (We avoid <Species> in <ecoregion> to simplify translations),
  constraint unique_features_per_scenario unique(scenario_id, geoprocessing_ops_hash)
);
```

    * `feature_data_ids` will be set depending on the `kind` of operation:

      * `copy/v1`

```sql
array[(select id from geodb.scenario_features_data where feature_id = <featureId from the specification>
and st_intersects(st_makeenvelope(<apidb.project.bbox>, 4326), the_geom))]
```

      * `split/v1`

```sql
array[(select distinct feature_data_id from geodb.feature_properties_kv where
feature_id = <featureId from the specification>
and key = <splitByProperty from the specification>
and value = <split[n].value from the specification>
and st_intersects(st_makeenvelope(<apidb.project.bbox>, 4326), bbox))]
```

      * `stratification/v1`

First we need to create a new `features` row, setting `project_id` to the
scenario's parent project so that this will be visible only within scenarios of
the project.

```sql
insert into features (feature_class_name, tag, creation_status) values
('<species / bioregional split>', 'species', 'created') returning id;
```

We can then compute the corresponding `features_data` row:

```sql
insert into features_data (the_geom, properties, source, feature_id)
select st_intersection(the_geom, (select the_geom from features_data fd where features_id = <featureId from the specification>)) as the_geom, 
(properties||(select properties from features_data fd where features_id = <featureId from the specification>)) as properties,
'intersection',
'<new feature id as created above in `features`>'
from features_data fd
where features_id = <featureId of the bioregional feature we split> and properties @> '{"dn":181}'
and st_intersects(the_geom, (select the_geom from features_data fd where features_id = <featureId from the specification>));
```

And we can finally create a matching `scenario_features` row, setting
`feature_data_ids` to `array[<id of the new features_data row inserted above>]`

    * link `features_data` to `scenarios` via `scenario_features_data` (in a transaction)

      * drop all the existing `scenario_features_data` rows for the given scenario
      * insert new: ids from `scenario_features.feature_data_ids`, `fpf` and
        `prop` from the specification, and `total_area` and `current_pa` from
        the queries listed in `featuresForScenario_logic.ipynb`.

    * set job status to success

### Retrieving the feature set specification for a scenario

To retrieve the (raw) specification for the list of features for a scenario:

```
GET /api/v1/scenarios/{scenarioId}/features/specification
```

The payload (`CreateGeoFeatureSetDTO`) is identical to what is described in the
previous section (this is actually stored verbatim, except for normalization
through storing the data in a PostgreSQL JSONB column).

To retrieve the list of features for a scenario, including calculated
properties:

```
GET /api/v1/scenarios/{scenarioId}/features
```

Payload (`GeoFeatureSet`):

```typescript
{
  scenarioId: string,
  projectId: string,
  status: 'draft' | 'created' | 'running' | 'done' | 'failure';
  features: [
    {
      featureId: string;
      tag: 'bioregional' | 'species',
      description: string;
      source: string;
      /**
       * If true, this should be displayed in the list of features in step
       * 2/2 (setting targets and FPF) but not sent as part of a recipe that
       * is being updated. I think it won't hurt to send it, and the API
       * can discard it if by mistake any geoprocessingOperations are specified
       * on it (unless we want to support splits of splits - very likely not).
       */

      fromGeoprocessing: boolean;
      status: 'draft' | 'created' | 'running' | 'done' | 'failure';
      marxanSettings: {
        spf: number;
        fpf: number;
      };

      geoprocessingOperations: [
        /**
         * Either one operation of kind split/v1 or one operation of kind
         * stratification/v1.
         */
        {
          kind: 'split/v1';
          splitByProperty: string;
          splits: [
            {
              value: string;
              status: 'draft' | 'created' | 'running' | 'done' | 'failure';

              marxanSettings: {
                spf: number;
                fpf: number;
              };
            }
          ]
        },
        {
          kind: 'stratification/v1';
          intersectWith: {
            featureId: string;
          };
          splitByProperty: string;
          splits: [
            {
              value: string;
              status: 'draft' | 'created' | 'running' | 'done' | 'failure';

              marxanSettings: {
                spf: number;
                fpf: number;
              };
            }
          ];
        }
      ];
    }
  ],
}
```
