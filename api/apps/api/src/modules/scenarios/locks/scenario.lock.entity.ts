import { Column, Entity, PrimaryColumn } from 'typeorm';

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

  @Column({
    type: `date`,
    name: `grab_date`,
  })
  grabDate!: Date;
}
