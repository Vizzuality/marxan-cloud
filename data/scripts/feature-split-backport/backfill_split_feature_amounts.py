#!/usr/bin/env python3
"""
Backfill `feature_amounts_per_planning_unit` for legacy SPLIT features that have
geometry (`features.feature_data_stable_ids`, e.g. after the stable-id backport)
but never had their per-planning-unit amounts computed [MRXNM-82].

WHY
---
A materialized split renders in two ways:
  * raw geometry  -> tile path `forProject=false`, filters `features_data` by
    `stable_id` (fixed by the stable-id backport);
  * abundance/amounts -> tile path `forProject=true`, reads
    `feature_amounts_per_planning_unit` by `feature_id`.
Some legacy live splits have geometry-reconstructable `stable_ids` (after the
backport) yet were never materialized into `feature_amounts_per_planning_unit`,
so they stay blank in the scenario amounts view. This computes & inserts those
amounts, mirroring `ComputeArea.computeAreaPerPlanningUnitOfFeature` ->
`FeatureAmountsPerPlanningUnitService.computeMarxanAmountPerPlanningUnit`.

SCOPE / SAFETY (limited to the relevant split features only)
------------------------------------------------------------
A feature is processed ONLY if ALL hold:
  * from_geoprocessing_ops->>'operation' = 'split'   (split features only)
  * feature_data_stable_ids is non-empty             (geometry present)
  * it has NO rows in feature_amounts_per_planning_unit yet (the gap; idempotent)
The amount computation is run PER FEATURE, scoped to that feature's OWN
stable_ids and its OWN project's planning units -> it can never write amounts for
any other feature. Non-split features are never read or touched.

NOTE: the API code path SKIPS `legacyImport`-source projects. This script does
not special-case sources by default because every in-scope prod split lives in a
`marxan_cloud` project; pass --skip-legacy-projects to enforce the skip anyway.

COMPUTE STRATEGY (per-PU union; see COMPUTE_INSERT_SQL):
  The original API compute builds ONE global ST_Union of all the split's
  geometries, which for large global splits is effectively unbounded -- it is what
  ran 2h45m on prod before being killed (and why those features never got amounts
  the first time round). This script instead intersects each geometry with each
  overlapping project PU first, then unions the fragments per PU. The amounts are
  numerically identical (verified on prod against both the global-union compute and
  the API's own stored amounts) but the cost scales with the project's PU count,
  not the feature's global vertex count -- the worst prod case (58,820 ids) went
  from infeasible to ~19s. This is what makes the large [MRXNM-99] splits tractable.

GUARDRAILS:
  * --statement-timeout S (default 600): bounds any single compute; a feature that
    exceeds it is reported and skipped, not fatal. With the per-PU compute this is
    a reliable net (worst observed prod compute ~72s), unlike the old monolithic
    ST_Union which a timeout/cancel could not interrupt mid-flight.
  * --max-stable-ids N (default 0 = OFF): legacy size cap, kept only as optional
    belt-and-suspenders. The per-PU compute removed the unboundedness that made
    this necessary, so it is OFF by default; set it to re-enable skipping very
    large splits if a host proves pathological.
  * Each feature commits in its OWN transaction, so a slow/failed one can never
    strand the features already computed (the previous all-at-once commit did).

ORDER: run AFTER `backport_feature_data_stable_ids.py` (this reads the stable_ids
that backport writes). Dry-run by default (rolls back); --apply to commit.
Idempotent. `amount_min/max` is intentionally NOT set (it is NULL even for the
working splits and is not needed for rendering).

USAGE
-----
  # via the bastion tunnel (staging->9432, prod->9433), dry-run:
  python3 backfill_split_feature_amounts.py --env staging
  python3 backfill_split_feature_amounts.py --env production
  # rehearse a single feature, then commit:
  python3 backfill_split_feature_amounts.py --env staging --only-feature <id>
  python3 backfill_split_feature_amounts.py --env production --apply
  # Nectar / any host -- pass connection explicitly:
  python3 backfill_split_feature_amounts.py \
      --host <h> --port 5432 \
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
        "api_db": "api-staging", "api_user": "api-staging",
        "geo_db": "geoprocessing-staging", "geo_user": "geoprocessing-staging",
    },
    "production": {
        "port": 9433,
        "api_db": "api-production", "api_user": "api-production",
        "geo_db": "geoprocessing-production", "geo_user": "geoprocessing-production",
    },
}

# Candidate split features (api DB). stable_ids cast to text[] so psycopg2 parses
# it to a Python list (a bare uuid[] would come back as the raw '{...}' string).
FIND_TARGETS_SQL = """
    SELECT f.id,
           f.project_id,
           f.feature_class_name,
           f.feature_data_stable_ids::text[] AS stable_ids,
           p.sources::text                   AS project_sources
    FROM features f
    JOIN projects p ON p.id = f.project_id
    WHERE f.from_geoprocessing_ops->>'operation' = 'split'
      AND f.feature_data_stable_ids IS NOT NULL
      AND cardinality(f.feature_data_stable_ids) > 0
    ORDER BY f.project_id, f.id
"""

# Already has amounts? (geo DB) -> skip (idempotent).
AMOUNTS_EXIST_SQL = """
    SELECT 1 FROM feature_amounts_per_planning_unit
    WHERE feature_id = %(feature_id)s LIMIT 1
"""

# Compute + insert in one statement, scoped to THIS feature's stable_ids and THIS
# project's planning units.
#
# The API's computeMarxanAmountPerPlanningUnit builds ONE global ST_Union of every
# feature_data row matched by stable_id, then intersects that single world-sized
# geometry against each PU. For large/global splits (tens of thousands of complex
# polygons) that union is effectively unbounded -- it is what ran 2h45m on prod.
#
# This computes the identical amounts the cheap way: intersect each feature_data
# geometry with each *overlapping* project PU first (bounded by the project's
# geographic extent via the && GiST index), then ST_Union the fragments PER PU.
# Because
#     Area( (U gi) ∩ pu )  ==  Area( U (gi ∩ pu) ),
# the per-PU amount is numerically identical (verified on prod: max relative diff
# 2e-15 vs the global-union compute), but each union now merges only the handful
# of polygons that touch that one PU, so the cost scales with the project's PU
# count rather than the feature's global vertex count. Worst case observed on prod
# (58,820 ids over a 7,123-PU project) dropped from "killed at 2h45m" to ~19s
# [MRXNM-99]. `amount > 0` only, matching the API.
COMPUTE_INSERT_SQL = """
    INSERT INTO feature_amounts_per_planning_unit
        (id, project_id, feature_id, project_pu_id, amount)
    WITH all_amount_per_planning_unit AS (
        SELECT ppu.id AS projectpuid,
               ST_Area(
                 ST_Transform(
                   ST_Union(ST_Intersection(fd.the_geom, pug.the_geom)),
                   3410
                 )
               ) AS amount
        FROM features_data fd
        JOIN planning_units_geom pug
          ON fd.the_geom && pug.the_geom
         AND ST_Intersects(fd.the_geom, pug.the_geom)
        JOIN projects_pu ppu
          ON ppu.geom_id = pug.id
         AND ppu.project_id = %(project_id)s::uuid
        WHERE fd.stable_id = ANY(%(stable_ids)s::uuid[])
        GROUP BY ppu.id
    )
    SELECT gen_random_uuid(), %(project_id)s::uuid, %(feature_id)s::uuid,
           projectpuid, amount
    FROM all_amount_per_planning_unit
    WHERE amount > 0
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
    p.add_argument("--skip-legacy-projects", action="store_true",
                   help="skip features in legacyImport-source projects (matches API)")
    p.add_argument("--only-feature", action="append", default=[],
                   help="restrict to specific feature id(s) (repeatable; testing)")
    p.add_argument("--limit", type=int, help="process at most N features (testing)")
    p.add_argument("--max-stable-ids", type=int, default=0,
                   help="OPTIONAL size cap: skip (do not compute) splits with more "
                        "than N stable ids. Legacy guard from when the compute used a "
                        "single unbounded ST_Union; the per-PU compute removed that "
                        "unboundedness so this is OFF by default (0). Set it to "
                        "re-enable skipping very large splits on a pathological host.")
    p.add_argument("--statement-timeout", type=int, default=600,
                   help="Per-feature statement_timeout in seconds; a feature that "
                        "exceeds it is reported and skipped, not fatal. Default 600 "
                        "(worst observed prod compute ~72s); pass 0 to disable.")
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
    return psycopg2.connect(host=host, port=port, dbname=dbname, user=user,
                            sslmode="require")


def main():
    args = parse_args()
    dry_run = not args.apply

    api_conn = connect(args.host, args.port, args.api_db, args.api_user)
    geo_conn = connect(args.host, args.port, args.geo_db, args.geo_user)
    geo_conn.autocommit = False

    print(f"[amounts] host={args.host}:{args.port} api={args.api_db} "
          f"geo={args.geo_db} mode={'DRY-RUN' if dry_run else 'APPLY'} "
          f"max_stable_ids={args.max_stable_ids or 'off'} "
          f"statement_timeout={args.statement_timeout or 'off'}s")

    api = api_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    geo = geo_conn.cursor()

    # Secondary net: bound any single compute. Set at session level (committed via
    # autocommit) so it survives the per-feature commits below. NB this is best
    # effort — a stuck PostGIS ST_Union may not hit an interrupt checkpoint, so the
    # --max-stable-ids guard below is the reliable protection.
    if args.statement_timeout:
        geo_conn.autocommit = True
        geo.execute("SET statement_timeout = %s", (args.statement_timeout * 1000,))
        geo_conn.autocommit = False

    api.execute(FIND_TARGETS_SQL)
    targets = api.fetchall()
    if args.only_feature:
        wanted = set(args.only_feature)
        targets = [t for t in targets if str(t["id"]) in wanted]
    if args.limit:
        targets = targets[: args.limit]
    print(f"[amounts] {len(targets)} candidate split feature(s) "
          f"(split + non-empty stable_ids)\n")

    # Per-feature transactions: each feature is committed (or rolled back) on its
    # own, so a slow/failed one can never strand the features already computed.
    computed, skipped, failed = 0, [], []
    for f in targets:
        fid = str(f["id"])
        name = f["feature_class_name"]
        n_ids = len(f["stable_ids"])
        try:
            if args.skip_legacy_projects and f["project_sources"] == "legacyImport":
                skipped.append((f, "legacyImport project"))
                print(f"  SKIP  {fid} ({name}): legacyImport project")
                geo_conn.rollback()
                continue

            geo.execute(AMOUNTS_EXIST_SQL, {"feature_id": fid})
            if geo.fetchone():
                skipped.append((f, "amounts already present"))
                print(f"  SKIP  {fid} ({name}): amounts already present")
                geo_conn.rollback()
                continue

            if args.max_stable_ids and n_ids > args.max_stable_ids:
                skipped.append((f, f"over --max-stable-ids ({n_ids} > {args.max_stable_ids})"))
                print(f"  SKIP  {fid} ({name}): {n_ids} stable ids "
                      f"> --max-stable-ids {args.max_stable_ids} (size cap enabled)")
                geo_conn.rollback()
                continue

            geo.execute(COMPUTE_INSERT_SQL, {
                "project_id": str(f["project_id"]),
                "feature_id": fid,
                "stable_ids": f["stable_ids"],
            })
            n = geo.rowcount
            if n == 0:
                skipped.append((f, "0 PU rows (no geometry/PU overlap)"))
                print(f"  WARN  {fid} ({name}): computed 0 PU rows (no overlap?) "
                      f"[{n_ids} stable ids]")
                geo_conn.rollback()
                continue

            if dry_run:
                geo_conn.rollback()
            else:
                geo_conn.commit()
            computed += 1
            print(f"  OK    {fid} ({name}): "
                  f"{'would insert' if dry_run else 'inserted'} {n} PU amount row(s) "
                  f"[{n_ids} stable ids]")

        except psycopg2.errors.QueryCanceled:
            geo_conn.rollback()
            failed.append((f, f"statement timeout (> {args.statement_timeout}s)"))
            print(f"  FAIL  {fid} ({name}): statement timeout after "
                  f"{args.statement_timeout}s [{n_ids} stable ids]; deferred to MRXNM-99")
        except psycopg2.Error as e:
            geo_conn.rollback()
            msg = str(e).strip().splitlines()[0] if str(e).strip() else type(e).__name__
            failed.append((f, msg))
            print(f"  FAIL  {fid} ({name}): {msg[:120]} [{n_ids} stable ids]")

    print(f"\n[amounts] summary: {computed} computed, {len(skipped)} skipped, "
          f"{len(failed)} failed, {len(targets)} candidates "
          f"({'DRY-RUN — nothing committed' if dry_run else 'committed per feature'})")
    if failed:
        print("[amounts] failed/timed-out feature(s) (see MRXNM-99):")
        for f, why in failed:
            print(f"  {f['id']}  {f['feature_class_name']}  -- {why}")

    api_conn.rollback()  # read-only
    api.close(); geo.close(); api_conn.close(); geo_conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
