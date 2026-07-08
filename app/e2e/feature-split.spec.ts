import { test, expect } from '@playwright/test';

/**
 * Happy-path e2e for materialized feature splitting in a scenario (MRXNM-82).
 *
 * SKIPPED BY DEFAULT so it never breaks CI (where the `split` flag is off and
 * there is no seeded splittable feature). To actually run it you need ALL of:
 *
 *  - `E2E_FEATURE_SPLIT=true` in the test-runner env (the switch below);
 *  - the `split` flag in the app build — run with
 *    `NEXT_PUBLIC_FEATURE_FLAGS=platformTransition,split` (playwright.config.ts
 *    now forwards `process.env.NEXT_PUBLIC_FEATURE_FLAGS` to the web server);
 *  - the materialized-splits backend deployed (PR #1714: P1 read-back + P2);
 *  - an authenticated session — configure Playwright `storageState` for a user
 *    with access to the seeded project/scenario (no shared auth helper exists in
 *    this suite yet; add one when enabling this test);
 *  - a seeded scenario whose feature list contains a splittable custom feature
 *    (one whose `properties` expose a categorical key), with ids/labels provided
 *    via env (see below).
 *
 * The in-panel selectors below are derived from the split modal and targets/SPF
 * table components; the auth setup, the custom Select interaction, and the
 * icon-button selectors should be confirmed against the running app when this
 * is activated.
 */
const ENABLED = process.env.E2E_FEATURE_SPLIT === 'true';

const PROJECT_ID = process.env.E2E_SPLIT_PROJECT_ID ?? '';
const SCENARIO_ID = process.env.E2E_SPLIT_SCENARIO_ID ?? '';
const FEATURE_NAME = process.env.E2E_SPLIT_FEATURE ?? '';
const SPLIT_PROPERTY = process.env.E2E_SPLIT_PROPERTY ?? '';

test.describe('Feature split (materialized)', () => {
  test.skip(
    !ENABLED,
    'Set E2E_FEATURE_SPLIT=true with the `split` flag on, the #1714 backend deployed, an authenticated storageState, and a seeded splittable feature.'
  );

  test('splits a feature into materialized children and renders them', async ({ page }) => {
    // 1. Open the scenario Features step.
    await page.goto(`/projects/${PROJECT_ID}/scenarios/${SCENARIO_ID}/edit?tab=features`);

    // 2. Open the row's 3-dot actions menu, then "Split".
    const featureRow = page.getByRole('row', { name: new RegExp(FEATURE_NAME, 'i') });
    await featureRow.getByRole('button').last().click();
    await page.getByRole('button', { name: 'Split' }).click();

    // 3. Modal: pick the property to split by and check at least one value.
    await expect(page.getByRole('heading', { name: 'Split feature' })).toBeVisible();
    // NOTE: `components/forms/select` is a custom widget — adjust if the option
    // is not exposed as a native combobox/option.
    await page.getByText('You can split this feature into categories').click();
    await page.getByText(SPLIT_PROPERTY, { exact: true }).click();
    await page.locator('.modal-checkbox-list input[type="checkbox"]').first().check();

    // 4. Save → submits the spec as `created`, triggering BE materialization.
    await page.getByRole('button', { name: 'Save' }).click();

    // 5. After the async `geofeatureSplit` job finishes, the materialized child
    //    rows appear, named `${parent} / ${value}`. Allow time for the job.
    await expect(page.getByText(new RegExp(`${FEATURE_NAME} / `, 'i')).first()).toBeVisible({
      timeout: 120_000,
    });

    // 6. (Optional) Confirm a materialized child draws from its OWN tiles — a real
    //    feature UUID, not the virtual `${parentId}-${value}` id. Toggle the
    //    child's "see on map" control and assert the tile request shape.
    //    The exact toggle selector should be confirmed against the running app.
    // const tileRequest = page.waitForRequest((req) =>
    //   /\/api\/v1\/geo-features\/[0-9a-f-]{36}\/preview\/tiles\//i.test(req.url())
    // );
    // await page.getByRole('row', { name: new RegExp(`${FEATURE_NAME} / `, 'i') })
    //   .first().getByRole('button').first().click();
    // await tileRequest;
  });

  /**
   * Regression: bulk-editing split children used to resubmit the spec with
   * `splits: []` (the modal's row snapshot never populated), which
   * un-materialized every child — i.e. the edit reversed the split. A bulk
   * edit must only change target/SPF; the split must survive.
   *
   * Requires the same env as the test above, with the scenario ALREADY
   * containing materialized split children (run the split test first).
   */
  test('bulk edit of split children applies values and preserves the split', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/scenarios/${SCENARIO_ID}/edit?tab=features`);

    const childRows = page.getByRole('row', { name: new RegExp(`${FEATURE_NAME} / `, 'i') });
    await expect(childRows.first()).toBeVisible({ timeout: 60_000 });
    const childCount = await childRows.count();

    // 1. Select every split-child row via its checkbox.
    for (let i = 0; i < childCount; i += 1) {
      await childRows.nth(i).getByRole('checkbox').check();
    }

    // 2. Bulk menu → Edit → set a new target for the selection.
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit selected features' })).toBeVisible();
    await page.getByLabel('Target (%)').fill('30');
    await page.getByLabel('SPF').fill('2');
    await page.getByRole('button', { name: 'Save' }).click();

    // 3. The edit succeeds…
    await expect(page.getByText('Features edited')).toBeVisible();

    // 4. …and the split children are still there (the split was NOT reversed),
    //    even after the spec read-back refreshes the table.
    await expect(childRows.first()).toBeVisible({ timeout: 60_000 });
    await expect(childRows).toHaveCount(childCount);
  });
});
