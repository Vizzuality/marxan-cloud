import { PartialType } from '@nestjs/swagger';
import { CreateGeoFeatureDTO } from './create.geo-feature.dto';

export class UpdateGeoFeatureDTO extends PartialType(CreateGeoFeatureDTO) {}
