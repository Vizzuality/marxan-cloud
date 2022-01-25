# Uploading legacy Marxan projects

Conservation planners may wish to upload to a MarxanCloud instance "legacy"
Marxan projects - that is, data files used to run Marxan CLI projects (`.dat`
files), alongside geospatial files used to generate these `.dat` files through
offline workflows, for example using desktop GIS or conservation planning
software.

Users may find it useful to import such projects into a MarxanCloud instance, in
order to, for example:

- continue working on an existing Marxan project taking advantage of the user
  workflows and data visualization features of the MarxanCloud platform
- collaborate on a legacy Marxan project which is still being developed, by
  moving it to the MarxanCloud platform and keeping the project private, while
  giving access to other MarxanCloud users as contributors
- share a legacy Marxan project broadly, through the MarxanCloud platform's
  _community_ area, thus contributing to a public archive/showcase of Marxan
  planning projects

## Legacy Marxan projects import in MarxanWeb

For reference, the Python-based [MarxanWeb
platform](https://docs.marxanweb.org/) supports importing legacy Marxan projects
(`.dat` files alongside a matching planning unit grid as shapefile), with the
following restrictions for the imported projects:

- Project features cannot be added or removed
- Showing the project features on the map is not supported
- Zooming to project features on the map is not supported
- Project features have only basic metadata, e.g. simple names and no
  descriptions

## Requirements

### Essential project data

As the MarxanCloud platform has a core component of data visualization and
mapping, legacy Marxan projects may only be imported if they match some minimum
requirements in terms of geospatial data available:

- _all the input `.dat` files_ **must be provided**

- as a minimum, a _planning unit grid shapefile_ **must be provided**

This will be used in the MarxanCloud platform as the geospatial "scaffolding"
on which other data is projected.

Each planning unit must have a `puid` property set to match the value used in
the `pu.dat` input file.

Other spatial data would "unlock" key features of the MarxanCloud platform:

**Shapefiles of features**

Without these, only presence/absence of each feature in any given planning unit
could be visualized (this data is inferred from `puvspr.dat` and `spec.dat`).

