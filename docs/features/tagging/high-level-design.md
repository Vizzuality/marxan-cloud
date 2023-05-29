# Feature Tagging (High-Level Design)

The selected solution for this feature is to implement a new table `feature_tags` on the API DB that will hold, for each
row, a tag for a given combination of feature and project id like this:

`| rowId (uuid) | projectId (uuid) | featureId (uuid) | tag (VARCHAR) |`

where:

- **rowId** is a generated UUID PK
- **projectId** is a foreign key referencing the PK of the Projects table with ON DELETE CASCADE set. Cannot be NULL.
- **featureId** is a foreign key referencing the PK of the Features table with ON DELETE CASCADE set. Cannot be NULL.
- **tag** contains the tag string itself, **case sensitive**, and cannot be NULL or empty. If a feature doesn't have
  any tags for a given project, then no rows associated to it should be present.
- There will be an **UNIQUE INDEX** on the combination of **`projectId` and `featureId`**. This will limit the number of
  tags to **1 tag per feature**.
- There will be an **UNIQUE INDEX** on the combination of **`projectId` and `LOWER(tag)`** in order to enforce
  **capitalization uniqueness** of the tag names

On the DB side, the size the `tag` is unbounded, but is bounded at the service level via validation by a configurable
amount of max characters.

Once the last feature with a given tag is removed or untagged, that tag won't be available to be selected as a tag
anymore. Tags will be considered removed from a project when there are no rows for a given `projectId` and `featureId`
combination with a given tag name.

**Capitalization uniqueness should be enforced at the service level**. When tagging/renaming a tag on a feature, a case
insensitive check must be made first to see if there's an already existing tag, regardless of capitalization, and use
that tag instead of the one provided by the user. For example, if a user tags a Feature with `Mogwai`, and other
features for the same project are already tagged with `mogwai` instead, `mogwai` should be used as the new tag. However
this capitalization uniqueness **should not be applied when renaming tags for a given project** as the user might want
to change capitalization of an existing tag.

Some other solutions considered were JSONB Arrays or an Array of text values, as an extra column on the `features`
table, containing all the tags in plain text form. Although these are better performant solutions in some use cases (tag
cloud generation, tag combination querying...), given the scope, budget and data volume, a more classic solution based
on an external table with JOINs is enough for this case.

More info on different tagging implementation approaches [here](http://www.databasesoup.com/2015/01/tag-all-things.html)

These are some of the main criteria used for deciding on the external table solution:

- **All tag managing operations are done per project**: this limits quite a bit the number of rows that queries must
  handle, since doing system wide queries are not contemplated.
- **System wide features are non-taggable**.
- **Low volume of feature entries**: each project will have features in the hundreds, low thousands at most.
- **Low number of tag entries**: the initial requirement is to have a max of 1 tag per feature; it is plausible to
  assume that even in the case that this limitation is expanded upon, the possible number of tags per feature would be
  in the low tens.
- **One tag per feature**: queries are further simplified because there won't be querying for tag combinations
- **The original `features` table remains the same**
- **Budget**

## Workflow

There are two distinct parts to the tagging system.

### Feature tagging operations

These endpoints deal with handling tags for an individual feature.

- `PATCH /api/v1/geo-features/:featureId/tags`

```typescript
Payload
{
	projectId: string
	tag: string;
}
```

Changes the current tag with the payload's `tag` for the feature with `featureId`.
`tag` should not be empty and should be validated to not to exceed the configurable maximum number of characters allowed
for tag names.

In order to maintain capitalization uniqueness, a check is made first to see if there is already a case insensitive
match with a previously existing tag for the same Project with `projectId`. If so, that tag will be used instead of the
tag provided in the payload.

- Extend `POST /api/v1/projects/:id/features/shapefile`

The `UploadShapefileDTO` should be expanded to also accept an optional tag field, so that **all Features created from
the shape file will be tagged with the same tag**.

It should not be empty and should be validated to not to exceed the configurable maximum number of characters allowed
for tag names.

In order to maintain capitalization uniqueness, a check is made first to see if there is already a case insensitive
match with a previously existing tag for the same Project with `projectId`. If so, that tag will be used instead of the
tag provided in the payload.

- `DELETE /api/v1/geo-features/:featureId/tags/`

Removes the tag for the given `featureId`. This means removing the corresponding row on the `feature_tags` table.

## Tag Managing

These endpoints deal with tag managing operations on a per Project level.

- `GET /api/v1/projects/:projectId/tags?tag=someName`

For the given `projectId`, returns a list of all the DISTINCT tags from the Project's Features that partially matches
the `tag` query parameter. By default, the matching is `containing`, but other options could be considered.

The `tag` query parameter may be optional, so that if it is empty, all the DISTINCT tags for the given `projectId` are
returned.

Ordered alphabetically by default.

No pagination required, since the possible number of tags per Project will be in the low tens, and the tag will have a
maximum size.

- `DELETE /api/v1/projects/:projectId/tags/?tag=someTagText`

For the given `projectId`, removes the tag from all the Project's features that have a tag that has an exact match
with `tag`.

- `PATCH /api/v1/projects/:projectId/tags/`

```typescript
Payload
{
	tag: string;
	newTag: string;
}
```

For the given `projectId`, changes the tag from all the Project's features that have a tag that matches the `tag` name
exactly to `newTag`.

`newTag` should be validated to not to exceed the configurable maximum number of characters allowed for tag names.
No capitalization uniqueness is enforced at service level in this case.

- Extend the `GET /api/v1/geo-features`

The already existing findAll is extended to allow searching by tags as well. This way it's consistent with the way that
entities are queried across the whole application, and the `GeoFeaturesRequestInfo` can be reused and extended to set
further the filtering by tag.

This filter field will contain a list of tags, and anyone of them must match exactly with the feature
tag ( `features_tag.tag IN ('tag1', 'tag2'...)` )

Another possible approach is to have a dedicated endpoint such
as `GET /api/v1/projects/:projectId/tagged-features?tag=someName` that would return the feature metadata for a
given `projectId` and `tag` combination.

Further clarification might be required with Frontend and Design
