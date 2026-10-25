<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Lift Log

A no-ads weightlifting log. Start a session from a template (or improvise), see what you lifted last time for each exercise, and log sets in pounds. A weekly view counts sets per muscle group so you can spot imbalances. "Surprise me" picks a random exercise for a muscle group from the equipment you have.

Built for *Design, Build, Ship* (MPCS 51238), Assignment 4: Full Stack App. Due Tue Oct 27, 2026.

## Stack

- Next.js (App Router) + Tailwind CSS
- Clerk for sign-in (development keys only)
- Supabase (Postgres) for data, connected to Clerk via Supabase third-party auth
- wger REST API (`https://wger.de/api/v2/`, no key) for the exercise catalog
- Playwright for the end-to-end test
- Deployed on Vercel (Hobby)

## Rules for the agent

- Never read, write, or print `.env` / `.env.*`. The user manages keys in `.env.local`.
- Secret keys (Clerk secret, Supabase service role) never go in client code or in `NEXT_PUBLIC_*` variables.
- Every table has a `user_id` column and row-level security on. Never disable RLS to make something work.
- Schema changes are Supabase migrations, never hand edits in the dashboard.
- Work in small commits on a branch; explain each change to the user before moving on. This is a learning project.

## Data model

Four tables. Every row belongs to one person through `user_id`, which is the Clerk user ID (text like `user_2abc…`, not a uuid). It defaults to `auth.jwt() ->> 'sub'`, and RLS policies compare against the same value.

```
Clerk user ──┬── workouts ──1:many── workout_sets
             ├── templates
             └── user_settings (one row per user)
wger API: exercise catalog, never stored wholesale; snapshots copied into rows
```

### `workouts`: one gym session
| column | type | notes |
|---|---|---|
| id | uuid pk | `gen_random_uuid()` |
| user_id | text not null | default `auth.jwt() ->> 'sub'` |
| name | text not null | "Push Day", or "Workout" if improvised |
| performed_on | date not null | default today |
| notes | text | optional |
| exercises | jsonb not null | planned exercises, same shape as `templates.exercises`; cards show before any set is logged |
| created_at | timestamptz | default `now()` |

### `workout_sets`: one row per set
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | text not null | default `auth.jwt() ->> 'sub'` |
| workout_id | uuid not null → workouts.id | `on delete cascade` |
| exercise_id | integer not null | wger exercise ID; used for "last time" lookups |
| exercise_name | text not null | snapshot from wger at log time |
| category | text not null | snapshot of wger category (Chest, Back, …); weekly chart |
| muscles | text[] not null | snapshot of wger **primary** muscles only; drill-down view |
| weight_lb | numeric(6,1) | null for bodyweight exercises; ≥ 0 |
| reps | integer not null | > 0 |
| created_at | timestamptz | default `now()`; orders sets within a workout |

No warm-up flag and no RPE: every logged set counts toward weekly volume.

### `templates`: saved session plans
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | text not null | default `auth.jwt() ->> 'sub'` |
| name | text not null | "Push Day" |
| exercises | jsonb not null | ordered list of `{exercise_id, name, category, muscles}` |
| created_at | timestamptz | default `now()` |

### `user_settings`: one row per user
| column | type | notes |
|---|---|---|
| user_id | text pk | default `auth.jwt() ->> 'sub'` |
| equipment_ids | integer[] not null | wger equipment IDs the user has; default `{}` (= any equipment) |
| starters_added | boolean not null | default false; starter templates copied once |

## Features → data

| Feature | Source |
|---|---|
| Log a workout | insert `workouts` + `workout_sets` |
| "Last time" for an exercise | user's latest `workout_sets` with that `exercise_id` |
| Weekly volume | count this week's (Mon–Sun) `workout_sets` by `category`; tap a category to count by `muscles` |
| Start a template | read `templates`, create a `workouts` row |
| Starter templates | constant in code (Push, Pull, Legs, Upper, Lower), copied into `templates` on first sign-in, then editable |
| Surprise me | wger `exerciseinfo` filtered by category and the user's `equipment_ids`, pick one at random |

## wger API notes

- Use `exerciseinfo/` (includes category, muscles, equipment, images, translations). `exercise/search/` returns 404.
- English name: the translation with `language === 2`. Descriptions are HTML: strip or sanitize, never inject raw.
- Muscle label: `name_en` if non-empty, else `name`.
- Empty filter → `200` with `results: []`; unknown exercise → `404`. Design for loading, empty, and unavailable.
- Labels are sometimes wrong (Overhead Press #687 is filed under Chest). Starter templates use exercises with correct labels, e.g. Bench Press 73, Shoulder Press Barbell 566, Lateral Raises 348, Triceps Pushdown 1185, Pull-ups 475, Barbell Row 1698, Hammer Curls 272, Romanian Deadlift 507, Barbell Full Squat 1801, Leg Curls 365, Standing Calf Raises 622.
- Content is CC-BY-SA: credit wger and the exercise author in the UI.
