Each phase assumes that given version of exported feature is fully importable.

# Release 1

* zip file generation
* zip file storage
* internal zip file format with versioning set
* blocking project/scenarios actions during export
* export project's:
    * metadata (name etc)
* export underlying scenarios with:
    * metadata (name etc)

# Release 2

* project's:
	* planning area: selected GADM & grid config settings
	* custom planning area: selected GADM & grid config settings (first 
	  shapefile handling)
	* generated PU with geometries

# Release 3

* project's:
	* custom grid, settings and generated PU with geometries
	* custom grid's shapefile (restored, not original)

// note: may happen this release could be done in parallel with r2

# Release 4

* scenario's:
	* ICUN categories (protected areas) & threshold
	* features specification (only pre-defined features)
	* spf/targets

# Release 5

* scenario's:
    * cost data per PU
    * lock status
    * marxan settings

# Release 6

* scenario's:
    * cost data per PU
    * lock status

# Release 7

* scenario's:
  * previous run results

# Release 8

* scenario's:
    * custom (uploaded) features
    * allow to `execute run` when uploading if there were no previous results

# Release X

* exclude licensed resources in exports

# Tech disclaimer

* While Scenario implementation phases aim at delivering full flow with no
  customizations first, Project includes all custom features first to avoid risk
  of having issues with underlying scenarios later.
* All phases should be preceded with spikes related to relevant points from HLD
  document (like shapefiles handling)
