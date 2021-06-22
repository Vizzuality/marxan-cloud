import { PartialType } from '@nestjs/swagger';
import { CreateGeoFeatureSetDTO } from './create.geo-feature-set.dto';

export class UpdateGeoFeatureSetDTO extends PartialType(CreateGeoFeatureSetDTO) {}
