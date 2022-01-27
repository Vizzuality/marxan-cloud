import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity(`scenario_locks`)
export class ScenarioLockEntity {
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

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: 'now()',
  })
  createdAt!: Date;
}

export class ScenarioLockResult {
  @ApiProperty()
  data!: ScenarioLockEntity;
}
