import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';

export const outputProjectSummaryResource: BaseServiceResource = {
  className: 'OutputProjectSummary',
  name: {
    singular: 'outputProjectSummary',
    plural: 'outputProjectSummaries',
  },
};

@Entity('output_project_summaries')
export class OutputProjectSummaryApiEntity {
  @Index()
  @ApiProperty()
  @PrimaryColumn('uuid', { name: 'project_id', nullable: false })
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
