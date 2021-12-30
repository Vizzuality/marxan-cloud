import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export enum ProjectRoles {
  project_owner = Roles.project_owner,
  project_contributor = Roles.project_contributor,
  project_viewer = Roles.project_viewer,
}
export class UserRoleInProjectDto {
  @IsUUID()
  @ApiProperty()
  userId!: string;

  @IsUUID()
  @ApiProperty()
  projectId!: string;

  @IsString()
  @IsEnum(Object.values(ProjectRoles))
  @ApiPropertyOptional({
    enum: ProjectRoles,
  })
  roleName?: ProjectRoles;
}

export class UsersInProjectResult {
  @ApiProperty({
    isArray: true,
    type: UserRoleInProjectDto,
  })
  data!: UserRoleInProjectDto[];
}
