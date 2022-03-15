import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import { API_EVENT_KINDS, ScenarioGeofeatureEvents } from '@marxan/api-events';
import { ScenarioGeofeatureDataV1Alpha } from '../events-data/scenario-geofeature-data-v1-alpha';
import { ValuesType } from 'utility-types';

// it's guarded by typing, no mismatch possible
const geofeatureEventKinds: ScenarioGeofeatureEvents = {
  scenario__geofeatureCopy__failed__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureCopy__failed__v1__alpha1,
  scenario__geofeatureCopy__finished__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureCopy__finished__v1__alpha1,
  scenario__geofeatureCopy__submitted__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureCopy__submitted__v1__alpha1,
  scenario__geofeatureSplit__failed__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureSplit__failed__v1__alpha1,
  scenario__geofeatureSplit__finished__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureSplit__finished__v1__alpha1,
  scenario__geofeatureSplit__submitted__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureSplit__submitted__v1__alpha1,
  scenario__geofeatureStratification__failed__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureStratification__failed__v1__alpha1,
  scenario__geofeatureStratification__finished__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureStratification__finished__v1__alpha1,
  scenario__geofeatureStratification__submitted__v1__alpha1:
    API_EVENT_KINDS.scenario__geofeatureStratification__submitted__v1__alpha1,
};
const allKindsValues = Object.values(geofeatureEventKinds);
export class ScenarioGeofeatureDataV1AlphaDTO
  implements ScenarioGeofeatureDataV1Alpha
{
  @ApiProperty()
  @IsUUID()
  featureId!: string;
  @ApiProperty()
  @IsIn(allKindsValues)
  kind!: ValuesType<ScenarioGeofeatureEvents>;
}
