import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LockStatus } from '../lock-status.enum';

export const scenariosPuDataEntityName = 'scenarios_pu_data';

const toLockEnum: Record<1 | 2, LockStatus> = Object.freeze({
  1: LockStatus.LockedIn,
  2: LockStatus.LockedOut,
});

const fromLockEnum: Record<LockStatus, 1 | 2 | null> = Object.freeze({
  [LockStatus.Unknown]: null,
  [LockStatus.LockedIn]: 1,
  [LockStatus.LockedOut]: 2,
});

@Entity(scenariosPuDataEntityName)
export class ScenariosPlanningUnitGeoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * missing FK
   */
  @Column({
    type: 'uuid',
    name: 'pu_geom_id',
  })
  puGeometryId!: string;

  /**
   * missing FK
   */
  @Column({
    type: 'uuid',
    name: 'scenario_id',
  })
  scenarioId!: string;

  /**
   * missing FK
   */
  @Column({
    type: 'int',
    name: 'puid',
  })
  projectId!: number;

  @Column({
    type: 'int',
    name: 'lockin_status',
    transformer: {
      from(value: number | null): LockStatus {
        if (value !== null && (value === 1 || value === 2)) {
          return toLockEnum[value];
        }
        return LockStatus.Unknown;
      },
      to(value: LockStatus): 1 | 2 | null {
        return fromLockEnum[value];
      },
    },
  })
  /**
   * null - not touched
   * 1 - locked-in (included)
   * 2 - locked-out (excluded)
   */
  lockStatus!: LockStatus;

  // relations not defined yet until it is necessary
}
