import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LockStatus } from './lock-status.enum';

const scenariosPuDataEntityName = 'scenarios_pu_data';

const toLockEnum: Record<0 | 1 | 2, LockStatus> = Object.freeze({
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
  /**
   * numeric id for each PU (unique within each scenario. It's called puid in the db as it maps directly to the same-named variable in Marxan dat files
   */
  planningUnitMarxanId!: number;

  // TODO: debt: either 0|1|2|3 or null|1|2|3; currently DB allows nulls
  // @Min(0)
  // @Max(3)
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
