import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export enum ScenarioRoles {
  scenario_owner = Roles.scenario_owner,
  scenario_contributor = Roles.scenario_contributor,
  scenario_viewer = Roles.scenario_viewer,
}

export class UserRoleInScenarioDto {
  @IsUUID()
  @ApiProperty()
  userId!: string;

  @IsUUID()
  @ApiProperty()
  scenarioId!: string;

  @IsString()
  @IsEnum(Object.values(ScenarioRoles))
  @ApiPropertyOptional({
    enum: ScenarioRoles,
  })
  roleName?: ScenarioRoles;
}

export class UsersInScenarioResult {
  @ApiProperty({
    isArray: true,
    type: UserRoleInScenarioDto,
  })
  data!: UserRoleInScenarioDto[];
}
