#!/usr/bin/env python3
"""
Backport `feature_data_stable_ids` for legacy materialized split features [MRXNM-82].

WHY
---
Split features are real `(apidb)features` rows (`from_geoprocessing_ops->>'operation'
= 'split'`) that own no geometry of their own: their geometry is a *subset* of the
parent feature's `(geodb)features_data` rows, identified by a key/value property.
The materialized-splits work links a split to that subset via the
`features.feature_data_stable_ids` uuid[] column. Splits created before that work
have an empty array, so the new code renders them with no geometry. This script
reconstructs and backfills that array.

SUBSET DEFINITION (decided 2026-06-18)
--------------------------------------
The subset is the **full K/V-matching set** of the parent's `features_data` rows
(the design doc's definition) — NOT bbox-filtered:
  * it matches how splits historically rendered (parent geometry filtered to the
    split property value, viewport-clipped only);
  * amounts are unaffected (they are bounded by the project's planning units, so
    out-of-project geometry contributes nothing regardless of subset breadth);
  * it avoids the `nominatim2bbox` bbox `@debt` in SplitQuery entirely.
The value match mirrors SplitQuery exactly: `trim('"' FROM fpkv.value::text)`.

SAFETY
------
* Additive + idempotent: only touches splits whose array is NULL/empty.
* Dry-run by default (rolls back); pass --apply to commit.
* Reconstructions that return 0 rows are SKIPPED and reported (never written as an
  empty array) so orphaned/anomalous splits can be investigated.
* Passwords come from ~/.pgpass / PGPASSWORD — never hard-coded here.

USAGE
-----
  # Azure (via the bastion tunnel: staging->9432, prod->9433), dry-run:
  python3 backport_feature_data_stable_ids.py --env staging
  python3 backport_feature_data_stable_ids.py --env production
  # commit:
  python3 backport_feature_data_stable_ids.py --env production --apply
  # Nectar (or any host) — pass connection explicitly:
  python3 backport_feature_data_stable_ids.py \
      --host db.example --port 5432 \
      --api-db marxan-api --api-user marxan-api \
      --geo-db marxan-geo-api --geo-user marxan-geo-api --apply
"""
import argparse
import sys

import psycopg2
import psycopg2.extras

# Azure-tunnel presets (api DB and geo DB live on the same server / port per env).
ENV_PRESETS = {
    "staging": {
        "port": 9432,
        "api_db": "api-staging",
        "api_user": "api-staging",
        "geo_db": "geoprocessing-staging",
        "geo_user": "geoprocessing-staging",
    },
    "production": {
        "port": 9433,
        "api_db": "api-production",
        "api_user": "api-production",
        "geo_db": "geoprocessing-production",
        "geo_user": "geoprocessing-production",
    },
}

FIND_SPLITS_SQL = """
    SELECT id,
           project_id,
           feature_class_name,
           from_geoprocessing_ops->>'baseFeatureId'   AS base_feature_id,
           from_geoprocessing_ops->>'splitByProperty' AS split_by_property,
           from_geoprocessing_ops->>'value'           AS value
    FROM features
    WHERE from_geoprocessing_ops->>'operation' = 'split'
      AND (feature_data_stable_ids IS NULL
           OR cardinality(feature_data_stable_ids) = 0)
    ORDER BY project_id, id
"""

# Full K/V-matching subset of the PARENT's features_data rows. Value match mirrors
# SplitQuery's `trim('"' FROM fpkv.value::text)`. No bbox filter (see module docs).
# NOTE: aggregate stable_id::text — psycopg2 does not parse a bare `uuid[]` result
# and would hand it back as the raw '{...}' string; a `text[]` is parsed to a list.
# `n` is returned alongside so we can assert the list length matches.
RECONSTRUCT_SQL = """
    SELECT array_agg(DISTINCT fd.stable_id::text) AS stable_ids,
           count(DISTINCT fd.stable_id)           AS n
    FROM feature_properties_kv fpkv
    JOIN features_data fd ON fd.id = fpkv.feature_data_id
    WHERE fpkv.feature_id = %(base_feature_id)s
      AND fpkv.key        = %(split_by_property)s
      AND trim('"' FROM fpkv.value::text) = trim('"' FROM %(value)s::text)
"""

UPDATE_SQL = """
    UPDATE features
    SET feature_data_stable_ids = %(stable_ids)s::uuid[]
    WHERE id = %(id)s
"""


def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--env", choices=ENV_PRESETS.keys(),
                   help="Azure-tunnel connection preset")
    p.add_argument("--host", default="localhost")
    p.add_argument("--port", type=int)
    p.add_argument("--api-db"), p.add_argument("--api-user")
    p.add_argument("--geo-db"), p.add_argument("--geo-user")
    p.add_argument("--apply", action="store_true",
                   help="commit changes (default: dry-run, rolls back)")
    p.add_argument("--limit", type=int,
                   help="process at most N split features (testing)")
    args = p.parse_args()

    preset = ENV_PRESETS.get(args.env, {})
    args.port = args.port or preset.get("port")
    args.api_db = args.api_db or preset.get("api_db")
    args.api_user = args.api_user or preset.get("api_user")
    args.geo_db = args.geo_db or preset.get("geo_db")
    args.geo_user = args.geo_user or preset.get("geo_user")

    missing = [n for n in ("port", "api_db", "api_user", "geo_db", "geo_user")
               if not getattr(args, n)]
    if missing:
        p.error(f"missing connection settings: {', '.join(missing)} "
                f"(use --env, or pass them explicitly)")
    return args


def connect(host, port, dbname, user):
    # password resolved from ~/.pgpass / PGPASSWORD; ssl required (Azure/Nectar).
    return psycopg2.connect(host=host, port=port, dbname=dbname, user=user,
                            sslmode="require")


def main():
    args = parse_args()
    dry_run = not args.apply

    api_conn = connect(args.host, args.port, args.api_db, args.api_user)
    geo_conn = connect(args.host, args.port, args.geo_db, args.geo_user)
    api_conn.autocommit = False

    print(f"[backport] host={args.host}:{args.port} api={args.api_db} "
          f"geo={args.geo_db} mode={'DRY-RUN' if dry_run else 'APPLY'}")

    api = api_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    geo = geo_conn.cursor()

    sql = FIND_SPLITS_SQL + (f" LIMIT {int(args.limit)}" if args.limit else "")
    api.execute(sql)
    todo = api.fetchall()
    print(f"[backport] {len(todo)} split feature(s) need backporting\n")

    updated, skipped = 0, []
    for f in todo:
        if not f["value"]:
            skipped.append((f, "no 'value' in from_geoprocessing_ops"))
            print(f"  SKIP  {f['id']} ({f['feature_class_name']}): no value")
            continue

        geo.execute(RECONSTRUCT_SQL, {
            "base_feature_id": f["base_feature_id"],
            "split_by_property": f["split_by_property"],
            "value": f["value"],
        })
        stable_ids, n = geo.fetchone()  # text[] (list) + count

        if not stable_ids:
            skipped.append((f, "0 matching features_data rows"))
            print(f"  SKIP  {f['id']} ({f['feature_class_name']}): 0 rows "
                  f"[base={f['base_feature_id']} key={f['split_by_property']} "
                  f"value={f['value']!r}]")
            continue

        assert len(stable_ids) == n, (
            f"array/count mismatch for {f['id']}: {len(stable_ids)} != {n}")

        api.execute(UPDATE_SQL, {"stable_ids": stable_ids, "id": f["id"]})
        updated += 1
        print(f"  OK    {f['id']} ({f['feature_class_name']}): "
              f"{len(stable_ids)} stable ids")

    print(f"\n[backport] summary: {updated} to update, {len(skipped)} skipped, "
          f"{len(todo)} total")

    if dry_run:
        api_conn.rollback()
        print("[backport] DRY-RUN — rolled back. Re-run with --apply to commit.")
    else:
        api_conn.commit()
        print(f"[backport] APPLIED — committed {updated} update(s).")
    geo_conn.rollback()  # read-only

    if skipped:
        print(f"\n[backport] {len(skipped)} skipped split feature(s) "
              f"(investigate before relying on them):")
        for f, reason in skipped:
            print(f"  {f['id']}  project={f['project_id']}  "
                  f"base={f['base_feature_id']}  key={f['split_by_property']}  "
                  f"value={f['value']!r}  -- {reason}")

    api.close(); geo.close(); api_conn.close(); geo_conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
