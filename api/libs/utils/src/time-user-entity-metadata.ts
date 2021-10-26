import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TimeUserEntityMetadata {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  createdAt?: Date | null;

  @Column('uuid', { name: 'created_by', nullable: true })
  createdBy?: string | null;

  @UpdateDateColumn({
    name: 'last_modified_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  lastModifiedAt?: Date | null;
}
