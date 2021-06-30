import { LessThan, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { BBox, GeoJSON } from 'geojson';
import { isDefined } from '@marxan/utils';
import { PlanningArea } from './planning-area.geo.entity';

export const planningAreasRepositoryToken = Symbol(
  'planning areas repository token',
);

@Injectable()
export class CustomPlanningAreaRepository {
  constructor(
    @Inject(planningAreasRepositoryToken)
    private readonly planningAreas: Repository<PlanningArea>,
  ) {}

  async saveGeoJson(
    data: GeoJSON,
  ): Promise<
    {
      id: string;
    }[]
  > {
    const result = await this.planningAreas.query(
      `
INSERT INTO "planning_areas"("the_geom")
  SELECT ST_SetSRID(
    ST_Collect(
      ST_GeomFromGeoJSON(features->>'geometry')
    ), 4326)::geometry
  FROM (
    SELECT json_array_elements($1::json->'features') AS features
  ) AS f RETURNING "id";
    `,
      [data],
    );
    return result;
  }

  async getBBox(id: string): Promise<BBox | undefined> {
    const result = await this.planningAreas.findOne(id);
    return result?.bbox;
  }

  async has(id: string): Promise<boolean> {
    const selectedId:
      | Pick<PlanningArea, 'id'>
      | undefined = await this.planningAreas.findOne(id, { select: ['id'] });
    return isDefined(selectedId?.id);
  }

  async assignProject(id: string, projectId: string): Promise<void> {
    await this.planningAreas.update(
      {
        projectId,
      },
      {
        projectId: null,
      },
    );
    await this.planningAreas.update(
      {
        id: id,
      },
      {
        projectId,
      },
    );
  }

  async deleteUnassignedOldEntries(
    maxAgeInMs: number,
    now: Date = new Date(),
  ): Promise<{
    affected?: number | null;
  }> {
    return await this.planningAreas.delete({
      projectId: null,
      createdAt: LessThan(new Date(+now - maxAgeInMs)),
    });
  }
}
