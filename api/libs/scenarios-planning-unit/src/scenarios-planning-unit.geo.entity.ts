import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { LockStatus } from './lock-status.enum';

const scenariosPuDataEntityName = 'scenarios_pu_data';

export const toLockEnum: Record<0 | 1 | 2, LockStatus> = Object.freeze({
  0: LockStatus.Unstated,
  1: LockStatus.LockedIn,
  2: LockStatus.LockedOut,
});

const fromLockEnum: Record<LockStatus, null | 1 | 2> = Object.freeze({
  [LockStatus.Unstated]: null,
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
  @PrimaryColumn({
    type: 'uuid',
    name: 'project_pu_id',
  })
  projectPuId!: string;

  /**
   * missing FK
   */
  @Column({
    type: 'uuid',
    name: 'scenario_id',
  })
  scenarioId!: string;

  /**
   * @debt: either 0|1|2|3 or null|1|2|3; currently DB allows nulls
   * @Min(0)
   * @Max(3)
   *
   * Caveat/@debt: as a side-effect of a mistake in the Marxan solver's manual
   * during early stages of this platform's development, values are stored as
   * 0/null, 1 or 2 internally, but then used as 0, 2 and 3 when generating
   * `pu.dat` files.
   *
   * Likewise, when importing legacy projects, we map back Marxan's values to
   * our internal representation (squashing Marxan's 0 and 1 to 0 internally, as
   * there is no use anywhere in the platform of the 1 status code).
   */
  @Column({
    type: 'int',
    name: 'lockin_status',
    transformer: {
      from(value: number | null): LockStatus {
        if (value !== null && (value === 1 || value === 2)) {
          return toLockEnum[value];
        }
        return LockStatus.Unstated;
      },
      to(value: LockStatus): null | 1 | 2 {
        return fromLockEnum[value];
      },
    },
  })
  /**
   * null - not touched
   * 1 - locked-in (included)
   * 2 - locked-out (excluded)
   */
  lockStatus?: LockStatus | null;

  @Column({
    type: `boolean`,
    nullable: false,
    default: false,
    name: `lock_status_set_by_user`,
  })
  setByUser?: boolean;

  @Column({
    type: 'float8',
    nullable: true,
  })
  xloc?: number | null;

  @Column({
    type: 'float8',
    nullable: true,
  })
  yloc?: number | null;

  @Column({
    type: 'float8',
    nullable: true,
    name: `protected_area`,
  })
  protectedArea?: number | null;

  @Column({
    type: `boolean`,
    nullable: false,
    default: false,
    name: `protected_by_default`,
  })
  protectedByDefault!: boolean;

  @Column('text', {
    array: true,
    name: 'feature_list',
    default: '{}',
  })
  featureList!: string[];

  // relations not defined yet until it is necessary
}
