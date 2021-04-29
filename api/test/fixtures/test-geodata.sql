--- Creates the grid for project 1 org 1
INSERT INTO planning_units_geom
(the_geom, type, size)
select st_transform(geom, 4326) as the_geom, 'square' as type, 1 as size from
(SELECT (ST_SquareGrid(1000, ST_Transform(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'), 3857))).*
 ) grid
 ON CONFLICT ON CONSTRAINT planning_units_geom_the_geom_type_key DO NOTHING;

--- Associate scenario with PU for scenario 1 project 1
INSERT INTO scenarios_pu_data (pu_geom_id, scenario_id, puid)
select id as pu_geom_id, '$scenario_id' as scenario_id, row_number() over () as puid
from planning_units_geom pug
where type='square' and size = 1;

--- Calculate pa area per pu and associated lockin based on PA
with pa as (select * from wdpa),
pu as (
select spd.id, pug.the_geom
from scenarios_pu_data spd
inner join planning_units_geom pug on spd.pu_geom_id = pug.id
where scenario_id='$scenario_id'),
pu_pa as (select pu.id, st_area(st_transform(st_intersection(pu.the_geom, pa.the_geom), 3410)) as pa_pu_area, st_area(st_transform(pu.the_geom, 3410)) as pu_area
          from pu
          left join pa on pu.the_geom && pa.the_geom)
UPDATE scenarios_pu_data
SET (protected_area, lockin_status) =
    (SELECT protected_area, (CASE (protected_area >  (0.3*pu_area))
                 WHEN true THEN 2
                 else 0 end) as lockin_status
    FROM (select id, sum(pa_pu_area) as protected_area, max(pu_area) pu_area
          from pu_pa group by id) as result
     WHERE scenarios_pu_data.id = result.id);

-- Create the conexion between Features and Scenario 1 Project 1.
INSERT INTO scenario_features_data
(feature_class_id, scenario_id, created_by, total_area)
select id, '$scenario_id' as scenario_id, '$user_id' as created_by,
st_area(
  st_transform(
    st_intersection(
      ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'),
       the_geom)
       )
      ) as total_area,
123 as fpf,
17 as prop
from features_data fd
where st_intersects(
  ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'),
    the_geom );

-- Features intersection with wdpa for our scenario to calculate area.
with features as (select * from scenario_features_data s
            inner join features_data p  on s.feature_class_id = p.id
            where s.scenario_id = '$scenario_id')
select features.id, st_area(
            st_transform(
              st_intersection(
                st_intersection(
                  ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'),
                   features.the_geom
                  ),
                wdpa.the_geom
              ), 3410)
            ) as area
from features
left join wdpa
  on f.the_geom && wdpa.the_geom;
