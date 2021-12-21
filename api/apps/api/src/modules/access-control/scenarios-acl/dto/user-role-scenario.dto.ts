import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export class UserRoleInScenarioDto {
  @IsUUID()
  @ApiProperty()
  userId!: string;

  @IsUUID()
  @ApiProperty()
  scenarioId!: string;

  @IsString()
  @IsEnum(Object.values(Roles))
  @ApiProperty()
  roleName?:
    | Roles.scenario_viewer
    | Roles.scenario_contributor
    | Roles.scenario_owner;
}

export class UsersInScenarioResult {
  @ApiProperty({
    isArray: true,
    type: UserRoleInScenarioDto,
  })
  data!: UserRoleInScenarioDto[];
}
