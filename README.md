# PocketBase Migrations

This repo contains PocketBase hooks and migrations.
The PocketBase binary and production data (`pb_data/`) live on the server and are not in this repo.

We separate development migrations from production-approved migrations.
Ops approves schema changes by copying selected files from `pb_migrations_dev/` into `pb_migrations/`.

## Folder Overview

- **`pb_hooks/`** — Server-side hooks used by PocketBase.

- **`pb_migrations_dev/`** — Development migrations (NOT used in production).

- **`pb_migrations/`** — Production-approved migrations (used by ops in prod).

## Standard Deployment Procedure (Ops)

Follow these steps for every release that includes schema changes.

### Step 1 — Approve migrations (copy/paste)

Dev will specify which migration files are approved for this release.

Copy only the approved files from dev to prod:

```bash
cp pb_migrations_dev/<approved_1>.js pb_migrations/
cp pb_migrations_dev/<approved_2>.js pb_migrations/
```

### Step 2 — Deploy the tagged release to the server

Deploy the tagged version of this repo to the server so that the server has:

- `pb_hooks/`
- `pb_migrations/`

### Step 3 — Back up production data

Before applying migrations, back up the entire `pb_data/` directory on the server.

### Step 4 — Apply migrations

From the directory that contains `pb_migrations/` and `pb_data/`:

```bash
/pocketbase/path/pocketbase migrate up
```

This works because PocketBase defaults to using:

- `./pb_data`
- `./pb_hooks`
- `./pb_migrations`

from the current working directory.

### Step 5 — Start PocketBase (production mode)

From the same directory:

```bash
/pocketbase/path/pocketbase serve --automigrate=false
```

`--automigrate=false` is required in production to prevent accidental schema changes.

### Step 6 — Smoke test

- Confirm PocketBase starts successfully
- Confirm admin UI and main endpoints work as expected

## Rules

- Never use `pb_migrations_dev/` in production.
- Always back up `pb_data/` before running migrations.
- Never rename or edit a migration file that has been applied in production.
- Production must always run with `--automigrate=false`.

## Rollback (if something goes wrong)

1. Stop PocketBase
2. Restore the `pb_data/` backup
3. Redeploy the previous release tag
4. Start PocketBase again

> Only use `migrate down` if dev explicitly confirms it is safe.

## Notes

- Ops controls which schema changes go live by choosing which migration files are copied into `pb_migrations/`.
- If a migration is not copied into `pb_migrations/`, it will not be applied in production.

Migrations and deployed code must be compatible. Apply migrations only for the matching release tag.