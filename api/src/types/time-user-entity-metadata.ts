import { ApiProperty } from '@nestjs/swagger';
import { User } from 'modules/users/user.api.entity';
import {
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

export abstract class TimeUserEntityMetadata {
  /**
   * Creation time.
   */
  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  /**
   * User who created the entity
   */
  @ApiProperty({ type: () => User })
  @ManyToOne((_type) => User)
  @JoinColumn({
    name: 'created_by',
    referencedColumnName: 'id',
  })
  createdBy: User;

  /**
   * Time of last edit.
   */
  @ApiProperty()
  @UpdateDateColumn({
    name: 'last_modified_at',
    type: 'timestamp without time zone',
  })
  lastModifiedAt: Date;
}
