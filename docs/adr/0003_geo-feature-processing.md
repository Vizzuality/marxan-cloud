# Processing of GeoFeatures

WIP - not structured yet as a proper ADR.

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
a sort of "recipe" for the definition of all the operations needed to select,
subset and intersect features, leading to the actual features being linked to
the scenario.

The actual GIS operations to produce new features via splitting or
stratification are only performed once the user finalises the list of features
and this is converted from `draft` status to `processing` status and a BullMQ
processing job for the definition is created.

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

  * Cheetas in Deserts and Xeric Shrublands
  * Cheetas in Flooded Grasslands and Savannas

  Names of the resulting subsets are generated via a template:

  `${species_feature_name} in ${bioregional_feature_name}`

### Defining the set of features for a scenario

To create or update the specification of the set of features for a scenario:

```
POST|PUT `/api/v1/scenarios/{sid}/features/specification`
```

We only support `POST` and `PUT`: the API always expects the full specification.

Handling `PATCH` requests would significantly increase implementation complexity
with arguably little benefit.

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

Payload (`CreateGeoFeatureSetDTO`):

```typescript
{
  status: 'draft' | 'created'
  features: [
    {
      featureId: string;

      /**
       * We can either have marxanSettings *or* geoprocessingOperations.
       * If marxanSettings is present (*but* we also need to set `kind: 'plain'`
       * because of limitations on the way we can describe union types),
       * the feature should be used as is (i.e. no splits/intersections),
       * with the given settings.
       *
       * If geoprocessingOperations is present (and `kind: 'withGeoprocessing'`,
       * see above), the features generated via geoprocessing operations will be
       * used, each with their marxanSettings as specified for each of them.
       */
      kind: 'plain' | 'withGeoprocessing';
      marxanSettings: {
        spf: number,
        fpf: number,
      },

      geoprocessingOperations: [
        /**
         * Either one operation of kind split/v1 or one operation of kind
         * stratification/v1.
         */
        {
          kind: 'split/v1',
          splitByProperty: string,
          splits: [
            {
              value: string,

              marxanSettings: {
                spf: number,
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
                spf: number,
                fpf: number,
              }
            }
          ]
        },
      ]
    }
  ],
};
```

### Retrieving a feature set for a scenario

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
  status: 'draft' | 'created' | 'running' | 'done' | 'failure',
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
