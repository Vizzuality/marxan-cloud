import { Role } from '@marxan-api/modules/access-control/role.api.entity';
import { Check, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenarioRoles } from '../dto/user-role-scenario.dto';

@Entity(`users_scenarios`)
export class UsersScenariosApiEntity {
  @PrimaryColumn({
    type: `uuid`,
    name: `user_id`,
  })
  userId!: string;

  @PrimaryColumn({
    type: `uuid`,
    name: `scenario_id`,
  })
  scenarioId!: string;

  @Check(`role_id`, `LIKE 'scenario_%'`)
  @PrimaryColumn({
    type: `varchar`,
    name: `role_id`,
  })
  roleName!: ScenarioRoles;

  @ManyToOne(() => Scenario, {
    onDelete: 'CASCADE',
    primary: true,
  })
  @JoinColumn({
    name: `scenario_id`,
    referencedColumnName: `id`,
  })
  scenario?: Scenario;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    primary: true,
  })
  @JoinColumn({
    name: `user_id`,
    referencedColumnName: `id`,
  })
  user?: User;

  @ManyToOne(() => Role, {
    primary: true,
  })
  @JoinColumn({
    name: `role_id`,
    referencedColumnName: `name`,
  })
  role?: Role;
}
