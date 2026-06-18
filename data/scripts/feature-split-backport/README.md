# Backport `feature_data_stable_ids` for legacy split features [MRXNM-82]

Legacy materialized split features (`(apidb)features` rows with
`from_geoprocessing_ops->>'operation' = 'split'`) were created before the
materialized-splits work and have an empty `feature_data_stable_ids`. The new
code renders them with no geometry. `backport_feature_data_stable_ids.py`
reconstructs that linkage from the parent feature's
`(geodb)feature_properties_kv` → `features_data.stable_id`.

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

## Usage

```bash
# via the bastion tunnel (staging->9432, prod->9433), dry-run (default):
python3 backport_feature_data_stable_ids.py --env staging
python3 backport_feature_data_stable_ids.py --env production
# commit:
python3 backport_feature_data_stable_ids.py --env production --apply
# Nectar / any host — pass connection explicitly (password via ~/.pgpass):
python3 backport_feature_data_stable_ids.py \
  --host <h> --port 5432 \
  --api-db marxan-api --api-user marxan-api \
  --geo-db marxan-geo-api --geo-user marxan-geo-api --apply
```

Additive + idempotent (only touches splits whose array is NULL/empty). Dry-run
rolls back. Reconstructions that return 0 rows are SKIPPED and reported, never
written as an empty array.

## Production dry-run findings (2026-06-18, Azure prod)

639 split features total:

| Outcome | Count |
|---|---|
| Reconstructable → backported | **463** (1–58,820 ids each; median 2; ~3.27M ids total) |
| Skipped — parent has no `features_data` (orphaned) | 154 |
| Skipped — no `value` in `from_geoprocessing_ops` | 22 |

- The **176 skipped** splits are pre-existing broken data the backport cannot
  fix (their source geometry is gone, or they have no split value). They also
  have no stored amounts — empty shells. Decide separately (delete / leave).
- **112 reconstructable splits have >10k stable ids (max 58,820).** See the tile
  perf follow-up below.

## Open follow-ups

1. **Tile perf for large-array splits.** `FeatureService.buildFeaturesWhereQuery`
   (fix in commit on `fix/mrxnm-82-split-feature-tiles`) emits
   `stable_id = ANY(ARRAY[...]::uuid[])` inline. For 10k–58k-element arrays this
   is multi-MB SQL per tile and won't scale. Needs a better predicate (join
   against a values set / temp table, or re-derive) before those splits render
   in production.
2. **New-code alignment (note to Andrés).** `split-operation.service.ts` sets
   `feature_data_stable_ids` from the **bbox-filtered** `SplitQuery` result. By
   the rationale above that's an over-constraint (and rides the `nominatim2bbox`
   debt): new splits would render narrower / mis-placed vs legacy ones. Suggest
   deriving from the full K/V subset there too, so new + backported splits match.
3. **Orphaned/valueless splits (176).** Data-quality cleanup, independent of this
   backport.
