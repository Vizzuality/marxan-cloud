import { Role } from '@marxan-api/modules/access-control/role.api.entity';
import { Check, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';

@Entity(`users_projects`)
export class UsersProjectsApiEntity {
  @PrimaryColumn({
    type: `uuid`,
    name: `user_id`,
  })
  userId!: string;

  @PrimaryColumn({
    type: `uuid`,
    name: `project_id`,
  })
  projectId!: string;

  @Check(`role_id`, `LIKE 'project_%'`)
  @PrimaryColumn({
    type: `varchar`,
    name: `role_id`,
  })
  roleName!: ProjectRoles;

  @ManyToOne(() => Project, {
    onDelete: 'CASCADE',
    primary: true,
  })
  @JoinColumn({
    name: `project_id`,
    referencedColumnName: `id`,
  })
  project?: Project;

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
