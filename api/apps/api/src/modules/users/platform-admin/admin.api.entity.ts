import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';

export const platformAdminResource: BaseServiceResource = {
  className: 'Platform_admin',
  name: {
    singular: 'platform_admin',
    plural: 'platform_admins',
  },
  entitiesAllowedAsIncludes: ['users'],
};

@Entity(`platform_admins`)
export class PlatformAdminEntity {
  @PrimaryColumn({
    type: `uuid`,
    name: `user_id`,
  })
  userId!: string;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
    primary: true,
  })
  @JoinColumn({
    name: `user_id`,
    referencedColumnName: `id`,
  })
  user?: User;
}
