import { ApiProperty, PickType } from '@nestjs/swagger';
import { ProtectedArea } from '../protected-area.geo.entity';
import { IUCNCategory } from '@marxan/iucn';

export class IUCNProtectedAreaCategoryDTO extends PickType(ProtectedArea, [
  'iucnCategory',
]) {
  @ApiProperty()
  iucnCategory!: IUCNCategory;
}

export class JSONAPIIUCNProtectedAreaCategoryData {
  @ApiProperty()
  type = 'iucn_protected_area_categories';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: IUCNProtectedAreaCategoryDTO;
}

export class IUCNProtectedAreaCategoryResult {
  @ApiProperty()
  data!: JSONAPIIUCNProtectedAreaCategoryData;
}
