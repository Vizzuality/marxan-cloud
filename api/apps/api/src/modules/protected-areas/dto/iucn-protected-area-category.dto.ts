import { ApiProperty, PickType } from '@nestjs/swagger';
import { IUCNCategory } from '@marxan/iucn';
import { ProtectedArea } from '@marxan/protected-areas';

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
