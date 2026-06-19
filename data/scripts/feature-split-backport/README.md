# Restore legacy split features [MRXNM-82]

Two one-off scripts that repair legacy materialized split features
(`(apidb)features` rows with `from_geoprocessing_ops->>'operation' = 'split'`)
created before the materialized-splits work:

1. **`backport_feature_data_stable_ids.py`** — relinks geometry: populates the
   empty `features.feature_data_stable_ids` from the parent feature's
   `(geodb)feature_properties_kv` -> `features_data.stable_id`.
2. **`backfill_split_feature_amounts.py`** — recomputes the per-planning-unit
   amounts (`feature_amounts_per_planning_unit`) for the subset of live splits
   that never had them.

New splits created by the current `split-operation` code need NEITHER — they get
both at creation. These scripts only touch pre-existing legacy splits.

## Subset definition (decided 2026-06-18)

The array is the **full K/V-matching subset** of the parent's `features_data`
rows — NOT bbox-filtered. Rationale:

- Matches how splits historically rendered (parent tiles + a client-side
  property filter = the full class geometry, viewport-clipped only).
- Amounts are unaffected: `feature_amounts_per_planning_unit` is bounded by the
  project's planning units, so out-of-project geometry contributes nothing
  regardless of how broad the array is (verified against prod).
- Matches the design doc's wording ("the subset that matches the K/V pair") and
  avoids the `nominatim2bbox` bbox `@debt` in `SplitQuery` entirely.

Value match mirrors `SplitQuery`: `trim('"' FROM fpkv.value::text)`.

## Phase 1 — geometry backport (`backport_feature_data_stable_ids.py`)

```bash
# via the bastion tunnel (staging->9432, prod->9433), dry-run (default):
python3 backport_feature_data_stable_ids.py --env staging
python3 backport_feature_data_stable_ids.py --env production
# commit:
python3 backport_feature_data_stable_ids.py --env production --apply
```

Additive + idempotent (only touches splits whose array is NULL/empty). Dry-run
rolls back. Reconstructions that return 0 rows are SKIPPED and reported, never
written as an empty array.

## Phase 2 — amounts backfill (`backfill_split_feature_amounts.py`)

Phase 1 makes a split render via the **raw-geometry** tile path
(`forProject=false`, by `stable_id`). But the scenario **abundance** view renders
via the `forProject=true` path, which reads `feature_amounts_per_planning_unit`
by `feature_id`. Most legacy splits already have those amounts (their values
*were* calculated at scenario time); some live ones never got them and stay blank
in the abundance view until recomputed.

This script computes & inserts those per-PU amounts, mirroring
`ComputeArea.computeAreaPerPlanningUnitOfFeature` /
`FeatureAmountsPerPlanningUnitService.computeMarxanAmountPerPlanningUnit`
(ST_Union of the `features_data` matched by `stable_id`, `&&` prefilter, then
`ST_Area(ST_Transform(ST_Intersection(...),3410))`, keeping `amount > 0`).

**Safety / scope** — only touches a feature when ALL hold: `operation = 'split'`
**and** `feature_data_stable_ids` non-empty **and** it has NO
`feature_amounts_per_planning_unit` rows yet. Each compute is scoped to that one
feature's own `stable_ids` and its own project's planning units, so it can never
write amounts for any other feature. Dry-run default; idempotent;
`--only-feature` / `--limit` / `--skip-legacy-projects` flags. It reads the
`stable_ids` phase 1 writes, so **run it after the backport.** `amount_min/max`
is intentionally not set (NULL even for working splits; not needed for rendering).

## Production findings (2026-06-18 / amounts cut 2026-06-19, Azure prod)

639 split features total. Backport reconstructs **463**; cross-referenced with
`feature_amounts_per_planning_unit`:

| Bucket | Count | Action |
|---|---|---|
| Reconstructable **+ has amounts** | **422** | phase 1 alone — fully restored |
| Reconstructable **- amounts** (live, non-draft scenarios) | **41** | phase 1 **+** phase 2 |
| Broken — 0 K/V rows (154) or no `value` (22), no amounts | **176** | delete (data cleanup) |

(422 + 41 + 176 = 639; backport ids range 1–58,820, median 2, ~3.27M total.)

## Nectar runbook

```bash
# phase 1 — relink geometry for all 463 reconstructable splits
python3 backport_feature_data_stable_ids.py --host <h> --port 5432 \
  --api-db marxan-api --api-user marxan-api \
  --geo-db marxan-geo-api --geo-user marxan-geo-api --apply
# phase 2 — amounts for the 41 live-but-amount-less (auto-targeted by the filter)
python3 backfill_split_feature_amounts.py --host <h> --port 5432 \
  --api-db marxan-api --api-user marxan-api \
  --geo-db marxan-geo-api --geo-user marxan-geo-api --apply
```

Validated on staging (2026-06-19): phase 1 relinked the one Spain split (5485
ids); phase 2 dry-run computed its amounts (2 PU rows); a fresh UI split on the
Rwanda project rendered correctly (geometry + amounts), confirming the
steady-state path.

## Open follow-ups

1. **Tile perf for large-array splits — [MRXNM-97].** `buildFeaturesWhereQuery`
   emits `stable_id = ANY(ARRAY[...])` inline; 112 reconstructable splits have
   >10k ids (max 58,820) → multi-MB SQL per tile. Needs a better predicate
   (values set / temp table, or re-derive) before those render in prod.
2. **Broken/dead splits (176).** Data-quality cleanup, independent of these
   scripts (no geometry to reconstruct, no amounts). Delete candidates.
