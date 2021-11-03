--- Creates the grid for project 1 org 1
INSERT INTO planning_units_geom
(the_geom, type, size)
select st_transform(geom, 4326) as the_geom, 'square' as type, 100 as size from
(SELECT (ST_SquareGrid(10000, ST_Transform(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'), 3857))).*
 ) grid;
 --- ON CONFLICT ON CONSTRAINT planning_units_geom_the_geom_type_key DO NOTHING;

--- Associate scenario with PU for scenario 1 project 1
INSERT INTO scenarios_pu_data (pu_geom_id, scenario_id, puid)
select id as pu_geom_id, '$scenario' as scenario_id, row_number() over () as puid
from planning_units_geom pug
where type='square' and size = 100;

--- Calculate pa area per pu and associated lockin based on PA
with pa as (select ST_MemUnion(the_geom) as the_geom from wdpa),
pu as (
select spd.id, pug.the_geom, pug.area as pu_area
from scenarios_pu_data spd
inner join planning_units_geom pug on spd.pu_geom_id = pug.id
where scenario_id='$scenario'),
pu_pa as (select pu.id, st_area(st_transform(st_intersection(pu.the_geom, pa.the_geom), 3410)) as pa_pu_area,
                                 pu_area
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
(feature_class_id, scenario_id, created_by, total_area, fpf, target)
select id, '$scenario' as scenario_id, '$user' as created_by,
st_area(
  st_transform(
    st_intersection(
      ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'),
       the_geom), 3410
       )
      ) as total_area,
  123 as fpf,
  17 as prop
from features_data fd
where st_intersects(
  ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'),
    the_geom );

-- Features intersection with wdpa for our scenario to calculate area.
with features_t as (select s.id, p.the_geom from scenario_features_data s
            inner join features_data p  on s.feature_class_id = p.id
            where s.scenario_id = '$scenario'),
features_wdpa as (select features_t.id as feature_scen_id, st_intersection(
                st_intersection(
                  ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'),
                   features_t.the_geom
                  ),
                wdpa.the_geom
              ) as the_geom, st_area(
            st_transform(
              st_intersection(
                st_intersection(
                  ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'),
                   features_t.the_geom
                  ),
                wdpa.the_geom
              ), 3410)
            ) as area_protected
from features_t
left join wdpa
  on features_t.the_geom && wdpa.the_geom
 and st_intersects(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[21.654052734375,-20.756113874762068],[23.719482421875,-20.756113874762068],[23.719482421875,-18.802318121688117],[21.654052734375,-18.802318121688117],[21.654052734375,-20.756113874762068]]]}'), wdpa.the_geom)
 )
 UPDATE scenario_features_data
SET (current_pa) = (select current_pa from (select sum(area_protected) current_pa, feature_scen_id from features_wdpa group by feature_scen_id) s where  feature_scen_id = scenario_features_data.id );

-- Cost equal area calculation project 1 scenario 1
INSERT INTO scenarios_pu_cost_data
(scenarios_pu_data_id, cost)
select id, 1 as cost  from scenarios_pu_data where scenario_id = '$scenario';

----Fake outputs
--- Fake output_scenarios_pu_data
WITH RECURSIVE nums (n) AS (
    SELECT 1
  UNION ALL
    SELECT n+1 FROM nums WHERE n+1 <= 10
),
data_raw as (
    SELECT n as run_id, scenarios_pu_data.id,
          case when round(random()) > 0 then true else false end as value
    FROM nums, scenarios_pu_data where scenarios_pu_data.scenario_id='$scenario'),
data as (
  select id, sum(CASE WHEN value THEN 1 ELSE 0 END) as included_count, array_agg(value) as value
  from data_raw group by id)
INSERT INTO output_scenarios_pu_data
(scenario_pu_id, included_count, value)
select * from data;

--- Fake output_scenarios_features_data
WITH RECURSIVE nums (n) AS (
    SELECT 1
  UNION ALL
    SELECT n+1 FROM nums WHERE n+1 <= 10
)
INSERT INTO output_scenarios_features_data
(run_id, feature_scenario_id, amount, occurrences, separation, target, mpm,
 total_area)
SELECT n as run_id, scenario_features_data.id, round(random()*53592) amount,
       round(random()*100) occurrences, 0 as separation, true as target,1 as
         mpm, round((random() + 1)*53592) total_area
FROM nums, scenario_features_data
where scenario_features_data.scenario_id='$scenario';
