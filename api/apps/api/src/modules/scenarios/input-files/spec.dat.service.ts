import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ScenarioFeaturesData } from '@marxan/features';
import { EntityManager, In, Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { SpecDataTsvFile } from './spec-dat-tsv-file';
import { apiConnections } from '@marxan-api/ormconfig';

export type ScenarioFeaturesDataForSpecDat = Pick<
  ScenarioFeaturesData,
  | 'featureId'
  | 'target'
  | 'prop'
  | 'fpf'
  | 'target2'
  | 'targetocc'
  | 'name'
  | 'sepNum'
  | 'metadata'
  | 'apiFeatureId'
>;

@Injectable()
export class SpecDatService {
  constructor(
    @InjectRepository(ScenarioFeaturesData, DbConnections.geoprocessingDB)
    private readonly scenarioFeaturesData: Repository<ScenarioFeaturesData>,
    @InjectEntityManager(apiConnections.default)
    private readonly apiEntityManager: EntityManager,
  ) {}

  async getSpecDatContent(scenarioId: string): Promise<string> {
    const rows: ScenarioFeaturesDataForSpecDat[] =
      await this.scenarioFeaturesData.query(
        `
      with grouped_feature as (
        select min(sfd.feature_id) as min_feature_id
        from public.scenario_features_data as sfd
        where sfd.scenario_id = $1
        group by sfd.api_feature_id
      )
      select
        feature_id as "featureId",
        -- For projects generated within the MarxanCloud platform, we only
        -- deal with prop. Legacy projects, when support for importing them is
        -- added, may rely on the target prop, but as this is not something that
        -- MarxanCloud will handle, we'll always rely on prop and instruct users
        -- to switch their data based on target to using prop instead; this
        -- avoids potential issues with measurement units for target potentially
        -- being different between features (as well as measurement units not
        -- being attached to the data)
        NULL as target,
        prop,
        fpf,
        target2,
        targetocc,
        api_feature_id as "apiFeatureId",
        sepnum as "sepNum",
        metadata
      from grouped_feature
      left join scenario_features_data as sfd on feature_id = grouped_feature.min_feature_id AND sfd.scenario_id = $1
      order by feature_id
    `,
        [scenarioId],
      );

    /**
     * Add feature names to exported data: mainly meant to be useful when users
     * request a downloadable artifact for a project, and want to inspect or use
     * offline the contents of the exported spec.dat file that we generate.
     *
     * Since db and processing overhead for this lookup is minimal, we do it in
     * any case (even when generating spec.dat files to feed to the Marxan
     * solver within the platform).
     */
    const rowsWithFeatureNames =
      await this.extendSpecDatContentWithFeatureNames(rows);

    const specDatFile = new SpecDataTsvFile();
    for (const row of rowsWithFeatureNames) {
      specDatFile.addRow(row);
    }

    return specDatFile.toString();
  }

  async extendSpecDatContentWithFeatureNames(
    rows: ScenarioFeaturesDataForSpecDat[],
  ): Promise<ScenarioFeaturesDataForSpecDat[]> {
    if (rows.length) {
      const scenarioFeatureNames: {
        id: string;
        featureClassName: string;
      }[] = await this.apiEntityManager
        .createQueryBuilder()
        .select('id, feature_class_name as "featureClassName"')
        .from('features', 'f')
        .where('f.id in (:...featureIds)', {
          featureIds: rows.map((row) => row.apiFeatureId),
        })
        .execute();

      const rowsWithFeatureNames = rows.map((row) => ({
        name: scenarioFeatureNames.find((sfn) => sfn.id === row.apiFeatureId)
          ?.featureClassName,
        ...row,
      }));

      return rowsWithFeatureNames;
    } else {
      return rows;
    }
  }
}
