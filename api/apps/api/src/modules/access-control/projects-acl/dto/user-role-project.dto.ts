import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { IsEnum, IsString, IsUUID } from 'class-validator';
export class UserRoleInProjectDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  projectId!: string;

  @IsString()
  @IsEnum(Object.values(Roles))
  roleName?:
    | Roles.project_viewer
    | Roles.project_contributor
    | Roles.project_owner;
}
