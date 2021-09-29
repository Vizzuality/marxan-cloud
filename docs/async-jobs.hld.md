# Background

Although, once request that triggers asynchronous job is submitted, every
following jobs statuses pooling will include just-submitted job, it ain't
enough information for consumers when to start pooling (i.e. missing bit
that some asynchronous job actually started).

# Conclusion

Solution agreed between FE and BE, considering cost, complexity and risk implications involved in more extensive (even if desirable) improvements:

* extend JSON-API metadata field

Consumers should implement generic mechanism to avoid white-listing which
endpoints are actually doing the async jobs - even, if the endpoint does not
return normalized JSON-API structure. Consider `body?.metadata?.started` check.

## DTO JsonApiAsyncJobMeta
* (required ☑️) `type` - `project` | `scenario`
* (required ☑️) `started` - `true | false`
* (required ☑️) `isoDate` - time when response was generated in ISO format
  (`2021-09-29T08:07:28.172Z` alike)
* (optional ◻️) `ids` - list of jobs IDs. Mostly not implemented yet

```json
{
  "meta": {
    "type": "project",
    "ids": [
      "string"
    ],
    "started": true,
    "isoDate": "string"
  }
}

```

## Related endpoints

Some jobs are coded as "inline" (see `Inline job` tag) thus they are
considered "sync" for API consumers.

At the moment of writing, all related endpoints are gathered under `Async
job` tag within Swagger Api Doc. Find the list below:

* `POST /api/v1/projects`
* `PATCH /api/v1/projects/{id}`
* `POST /api/v1/projects/{id}/grid`
* `POST /api/v1/projects/{id}/protected-areas/shapefile`
* `POST /api/v1/scenarios`
* `PATCH /api/v1/scenarios/{id}`
* `POST /api/v1/scenarios/{id}/features/specification/v2`
* `POST /api/v1/scenarios/{id}/cost-surface/shapefile`
* `PATCH /api/v1/scenarios/{id}/planning-units`
* `POST /api/v1/scenarios/{id}/marxan`

