import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
export class UserRoleInProjectDto {
  @IsUUID()
  @ApiProperty()
  userId!: string;

  @IsUUID()
  @ApiProperty()
  projectId!: string;

  @IsString()
  @IsEnum(Object.values(Roles))
  @ApiProperty()
  roleName?:
    | Roles.project_viewer
    | Roles.project_contributor
    | Roles.project_owner;
}
