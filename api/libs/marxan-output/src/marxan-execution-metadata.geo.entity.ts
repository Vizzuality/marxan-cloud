import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('marxan_execution_metadata')
export class MarxanExecutionMetadataGeoEntity {
  /**
   * id
   */
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Index()
  @Column({
    nullable: false,
  })
  scenarioId!: string;

  @Column({ name: `std_out`, nullable: true, type: 'character varying' })
  stdOutput?: string | null;

  @Column({ name: `std_err`, nullable: true, type: 'character varying' })
  stdError?: string | null;

  @Column({
    type: 'bytea',
    nullable: false,
    name: `input_zip`,
  })
  inputZip!: Buffer;

  @Column({
    type: 'bytea',
    nullable: true,
    name: `output_zip`,
  })
  outputZip?: Buffer | null;
}
