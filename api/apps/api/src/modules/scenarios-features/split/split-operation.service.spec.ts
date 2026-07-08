import { SplitOperation } from './split-operation.service';

/**
 * A materialized split feature's `feature_data_stable_ids` must be the FULL
 * key/value-matching subset of the parent's features_data rows — the same set
 * the legacy backport writes and what splits historically rendered (full class).
 * It must NOT be the bbox-filtered scenario-preparation rows that `SplitQuery`
 * returns (those are only for scenario prep / amounts).
 */
describe('SplitOperation feature_data_stable_ids derivation', () => {
  it('derives stable ids from the full K/V subset, not the bbox-filtered split-query rows', async () => {
    const featureId = 'split-feature-1';
    const singleSplitFeature = {
      operation: 'split',
      baseFeatureId: 'parent-feature-1',
      splitByProperty: 'w_ecosystm',
      subset: {
        value: 'Warm Temperate Moist Sparsley or Non vegetated on Plains',
      },
    };
    const kvStableIdRows = [{ stable_id: 's1' }, { stable_id: 's2' }];

    // 1st geo query = the stable-id lookup; 2nd = SplitQuery (scenario prep).
    // Stable ids must land first: ComputeArea derives the child's per-PU
    // amounts from them, and the prep insert reads those amounts.
    const query = jest
      .fn()
      .mockResolvedValueOnce(kvStableIdRows)
      .mockResolvedValueOnce([{ id: 'sfp-1', features_data_id: 'fd-bbox-1' }]);

    const setFeatureDataStableIdsForFeature = jest.fn();
    const splitCreateFeatures = {
      createSplitFeatures: jest
        .fn()
        .mockResolvedValue([{ id: featureId, singleSplitFeature }]),
      setFeatureDataStableIdsForFeature,
    };
    const splitDataProvider = {
      prepareData: jest.fn().mockResolvedValue({
        project: { id: 'project-1', bbox: [0, 0, 1, 1] },
        protectedAreaFilterByIds: [],
        planningAreaLocation: undefined,
      }),
    };
    const splitQuery = {
      prepareQuery: jest
        .fn()
        .mockReturnValue({ query: 'SPLIT_QUERY_SQL', parameters: [] }),
    };
    const computeArea = {
      computeAreaPerPlanningUnitOfFeature: jest
        .fn()
        .mockResolvedValue(undefined),
    };
    const events = { create: jest.fn().mockResolvedValue(undefined) };

    const sut = new SplitOperation(
      splitCreateFeatures as never,
      splitDataProvider as never,
      splitQuery as never,
      computeArea as never,
      { query } as never,
      events as never,
    );

    await sut.split({
      scenarioId: 'scenario-1',
      specificationId: 'spec-1',
      input: {} as never,
    });

    const kvCall = query.mock.calls.find(
      ([sql]) =>
        typeof sql === 'string' && sql.includes('feature_properties_kv'),
    );
    expect(kvCall).toBeDefined();
    expect(kvCall![1]).toEqual([
      'parent-feature-1',
      'w_ecosystm',
      'Warm Temperate Moist Sparsley or Non vegetated on Plains',
    ]);
    expect(setFeatureDataStableIdsForFeature).toHaveBeenCalledWith(
      featureId,
      kvStableIdRows,
    );

    // Gap-analysis correctness depends on this ordering: the prep insert
    // fills total_area/current_pa from the CHILD's per-PU amounts, so
    // ComputeArea must have run for the child before the SplitQuery insert
    // (and after its stable ids were stored).
    expect(
      computeArea.computeAreaPerPlanningUnitOfFeature,
    ).toHaveBeenCalledWith('project-1', 'scenario-1', featureId);

    const computeAreaOrder =
      computeArea.computeAreaPerPlanningUnitOfFeature.mock
        .invocationCallOrder[0];
    const prepInsertCallIndex = query.mock.calls.findIndex(
      ([sql]) => sql === 'SPLIT_QUERY_SQL',
    );
    expect(prepInsertCallIndex).toBeGreaterThanOrEqual(0);
    const prepInsertOrder = query.mock.invocationCallOrder[prepInsertCallIndex];
    const stableIdsOrder =
      setFeatureDataStableIdsForFeature.mock.invocationCallOrder[0];

    expect(stableIdsOrder).toBeLessThan(computeAreaOrder);
    expect(computeAreaOrder).toBeLessThan(prepInsertOrder);
  });
});
