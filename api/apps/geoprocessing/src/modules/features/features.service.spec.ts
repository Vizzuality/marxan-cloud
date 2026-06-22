import { FeatureService } from './features.service';

/**
 * Unit tests for the WHERE-clause builder that drives feature MVT tiles.
 *
 * Materialized split features do not own any `features_data` rows of their own:
 * their geometries are a subset of the *parent* feature's rows, identified by
 * the stable ids stored in `(apidb)features.feature_data_stable_ids`. The tile
 * query for a split feature must therefore select geometries by `stable_id`,
 * not by the split feature's own `feature_id` (which matches zero rows).
 */

const buildService = ({
  stableIds,
  tableName = 'features_data',
}: {
  stableIds: string[] | null;
  tableName?: string;
}): { service: FeatureService; createQueryBuilder: jest.Mock } => {
  const queryBuilder = {
    select: () => queryBuilder,
    from: () => queryBuilder,
    where: () => queryBuilder,
    execute: () => Promise.resolve([{ feature_data_stable_ids: stableIds }]),
  };
  const createQueryBuilder = jest.fn(() => queryBuilder);
  const apiEntityManager = { createQueryBuilder };
  const featuresRepository = { metadata: { tableName } };
  const service = new FeatureService(
    featuresRepository as never,
    apiEntityManager as never,
    {} as never,
  );
  return { service, createQueryBuilder };
};

describe(`${FeatureService.name}.buildFeaturesWhereQuery`, () => {
  it('filters a split feature by its features_data stable ids, not by the split feature id', async () => {
    const splitFeatureId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const stableIds = [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
    ];

    const { where, parameters } = await buildService({
      stableIds,
    }).service.buildFeaturesWhereQuery(splitFeatureId, false);

    // The ids are bound as a single array parameter, not inlined as literals,
    // so the SQL text stays small regardless of how many ids a split has
    // [MRXNM-97].
    expect(where).toBe('stable_id = ANY(:splitFeatureStableIds::uuid[])');
    expect(parameters).toEqual({ splitFeatureStableIds: stableIds });
    expect(where).not.toContain(stableIds[0]);
    expect(where).not.toContain('ARRAY[');
  });

  it('filters by feature_id (and never looks up stable ids) on the project amounts path', async () => {
    const featureId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const { service, createQueryBuilder } = buildService({
      // even if stable ids exist, the amounts table has no stable_id column and
      // amounts are materialized per feature id, so they must not be used here
      stableIds: ['33333333-3333-3333-3333-333333333333'],
    });

    const { where, parameters } = await service.buildFeaturesWhereQuery(
      featureId,
      true,
    );

    expect(where).toBe(`feature_id = '${featureId}'`);
    expect(where).not.toContain('stable_id');
    expect(parameters).toBeUndefined();
    expect(createQueryBuilder).not.toHaveBeenCalled();
  });

  it('falls back to feature_id for a plain/legacy feature with no stable ids', async () => {
    const featureId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

    const { where, parameters } = await buildService({
      stableIds: null,
    }).service.buildFeaturesWhereQuery(featureId, false);

    expect(where).toBe(`feature_id = '${featureId}'`);
    expect(parameters).toBeUndefined();
  });

  it('appends the bbox envelope filter to a split feature query', async () => {
    const stableIds = ['44444444-4444-4444-4444-444444444444'];

    const { where, parameters } = await buildService({
      stableIds,
    }).service.buildFeaturesWhereQuery(
      'dddddddd-dddd-dddd-dddd-dddddddddddd',
      false,
      [-1, 40, 1, 42],
    );

    expect(where).toContain('stable_id = ANY(:splitFeatureStableIds::uuid[])');
    expect(parameters).toEqual({ splitFeatureStableIds: stableIds });
    expect(where).toContain('AND');
    expect(where).toContain('st_intersects');
    expect(where).toContain('the_geom');
  });
});
