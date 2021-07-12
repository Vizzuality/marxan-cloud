# [API and Data engineering] Marxan run and outputs

* Date: 12 Jul 2021
* Status: draft
* Deciders: Alicia Arenzana and Elena Palao
## Context and problem statement
As part of the Marxan project, we need to serve to the client the following datasets as vector tiles:

* Administrative areas or gadm
* Protected areas or WDPA: this geometries could be filtered either by the API or by the front end. We will need to discuss the best solution based on our requirements. 
* Planning units: these planning units will have the following associated  info:
WDPA intersected. % area protected in each PUs
	* Features
	* Costs
	* Lock-in / Lock-out areas
	* Results.
	* Frequency map.
* Features


## Decision drivers
We required flexibility in order to be able to display data required.


## Considered options
### Dynamic MVT Service
Dynamically query and serve MVT from the DB; this will reduce duplicity in data; but will add some db transaction costs. Dynamic MVT Service quickly provides a complete subset of data for a specific area that is highly cacheable. Most of this provided speed and cache-ability is specifically gained by preprocessing all the data you will use in your map into tiles. 
**Problems**: this requires a minimum Postgres 12 version with postgis 3 to be able to reduce query complexity and to be able to generate the MVT from DB.
We can serve the dynamic MVT service with many different systems:
* Through a materialized view: A materialized view is a  logical view of your data database object that contains the (results of a query) that has been saved (physically stored) so you pay the price of the join once (or as often as you refresh your materialized view). The downside though is that the data you get back from the materialized view is only as up to date as the last time the materialized view has been refreshed. The FROM clause of the query can name tables, views, and other materialized views. Collectively these objects are called master tables (a replication term) or detail tables (a data warehousing term). This reference uses "master tables" for consistency. The databases containing the master tables are called the master databases.
The main inconveniences that a materialised view could have are related with a major usage of the db or the need of a refresh strategy with every update. However the response in serving the tile to the client should be quicker.
* Through views: A view evaluates the data in the tables underlying the view definition at the time the view is queried. It is a logical view of your tables, with no data stored. The upside of a view is that it will always return the latest data to you. The downside of a view is that its performance depends on how good a select statement the view is based on.
* Through functions or stored procedures: functions and stored procedures are faster than views or plain queries because they reused cached query plans that cuts off some planning overhead and makes them a bit faster. Using stored procedures aka PL/pgSQL also allow more logic than what a normal sql does.
* Through dynamic queries or prepared statements: the MVT’s are generated using a PostGIS ST_AsMVT function that queries directly the db. 

### Static MVT Service
Pregenerate version of the admin geometries used on the DB to be served as MVT. In conjunction with an endpoint in the Api that serves the data using a service like mbtile server to provide access to the pregenerated mbtiles.
**Problems**: It doesn't allow the flexibility as any geometry change will require a full recreation of the tiles


## Decision outcome
Based on the complexity of this project, the nature of the data that is updated quite regularly, and the types of analysis we have to perform and datasets that we need to serve, the best viable solution is a dynamic MVT service. But we need to bear in mind the problems associated to a dynamic service:
* Under performant queries with large extension or large/complex geometries 
* Under performant queries due to the amount of  associated attributes
* Cache
* Simplification
* Concurrency
Steps for turning raw data into MVT through a dynamic server: 
1) Determine the hierarchy of your data. 
2) Simplify your data based on your zoom level following your hierarchy rules. 
3) Clip your data to your tile and encode it to your vector tile. 
The problem is that doing these steps is often very complex and can drastically affect performance (e.g. if you’re dynamically serving tiles from PostGIS it's very hard to reduce large quantities of data quickly in some cases). A solution can be to cache the resulting tiles for a longer period to limit load on your db or to preprocess all your data before serving. Therefore, the generated tiles should be cached in a separate PostGIS table when generated from a data source and served directly from the tile cache when possible.
Despite all of the listed above, getting the MVT through querying the database is the best approach for our purpose as our data would be updated regularly. 

| Datasets | Requirements |
|---|---|
| Admin (gadm/eez) | * It’s not updated frequently * Large and complex geometries |
| WDPA | Would be updated once a month The user can add their own Large and complex geometries |
| Features | Once the geometry is imported does not change The user can add new ones (the initial table will increase), the user can create their own ones from existing ones (intersection, etc) Large and complex geometries |
| Planning Units (PU) | The user can add their own
Once the geometry is imported does not change  |

As we have highlighted above, one of the main issues that we can face by serving dynamically vector tiles is the performance of de db for simplifying geometries in each zoom level. There are two possible solutions that we have taken into account:
* Zoom level restriction on the FrontEnd
* Generate a table or a materialize view associated with our initial geometries with a simplified version of this geometries.  This means that the geoprocessing db will increase but it can be replicated as many times as it's necessary. This will require async jobs to create the simplified versions and populates cache.ase but it can be replicated as many times as it's necessary.
* Redis cache upfront to reduce the number of transactions at db level.


## References
[vector tile example](https://info.crunchydata.com/blog/production-postgis-vector-tiles-caching)  
[General structure of vector tile endpoint](https://github.com/mapbox/vector-tile-spec/tree/master/2.1)  
[Reference for the generation of our vector tile server](https://github.com/opengeospatial/ogcapi-tiles)  
[Tilerator](https://github.com/kartotherian/kartotherian/blob/master/packages/tilerator/doc/commands.md)  
[Examples for different vector tiles servers](https://github.com/mapbox/awesome-vector-tiles)  
[Minimal tile server](https://github.com/pramsey/minimal-mvt/blob/master/minimal-mvt.py)  
[More info about tile server](https://info.crunchydata.com/blog/dynamic-vector-tiles-from-postgis)  

