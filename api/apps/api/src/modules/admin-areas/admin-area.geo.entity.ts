import { ApiProperty } from '@nestjs/swagger';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import { AdminArea } from '@marxan/admin-regions';

export const adminAreaResource: BaseServiceResource = {
  className: 'AdminArea',
  name: {
    singular: 'admin_area',
    plural: 'admin_areas',
  },
};

export class JSONAPIAdminAreaData {
  @ApiProperty()
  type = 'administrative-areas';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: AdminArea;
}

export class AdminAreaResult {
  @ApiProperty()
  data!: JSONAPIAdminAreaData;
}
