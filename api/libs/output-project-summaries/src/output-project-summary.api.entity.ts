import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('output_project_summaries')
export class OutputProjectSummaryApiEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Index()
  @ApiProperty()
  @Column('uuid', { name: 'project_id', nullable: false })
  projectId!: string;

  @ApiProperty()
  @Column({
    type: 'bytea',
    nullable: false,
    name: `summary_zipped_data`,
  })
  summaryZippedData!: Buffer;

  @ApiProperty()
  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', name: 'last_modified_at' })
  lastModifiedAt!: Date;
}
