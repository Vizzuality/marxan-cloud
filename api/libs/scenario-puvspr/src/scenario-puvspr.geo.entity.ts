import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `
    select pu.scenario_id as scenario_id, puid as pu_id, feature_id, ST_Area(ST_Transform(st_intersection(species.the_geom, pu.the_geom),3410)) as amount
    from
    (
        select scenario_id, the_geom, sfd.feature_id
        from scenario_features_data sfd
        inner join features_data fd  on sfd.feature_class_id = fd.id
    ) species,
    (
        select the_geom, spd.puid, spd.scenario_id
        from planning_units_geom pug
        inner join scenarios_pu_data spd on pug.id = spd.pu_geom_id order by puid asc
    ) pu
    where st_intersects(species.the_geom, pu.the_geom)
    order by puid, feature_id asc
  `,
})
export class ScenarioPuvsprGeoEntity {
  @ViewColumn({
    name: 'scenario_id',
  })
  scenarioId!: string;

  @ViewColumn({
    name: 'pu_id',
  })
  puId!: string;

  @ViewColumn({
    name: 'feature_id',
  })
  featureId!: string;

  @ViewColumn({
    name: 'amount',
  })
  amount!: number;
}
