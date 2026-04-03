---
name: zero-touch-class-builder
description: Build and extend zero-touch class/lesson systems where lessons are file-driven (JSON/Markdown/Infographic JSON) and simulations are module-driven. Use when adding a new class, creating class metadata/slides/infographics, registering index entries, implementing simulation endpoints with custom data/algorithms, and optionally attaching dedicated frontend modules while preserving auto-routing.
---

# Zero-Touch Class Builder

## Overview

Create new classes with modular content and optional interactive modes without breaking runtime discovery.

Supported lesson delivery modes:
- `Slides`: markdown narrative (`slides.md`)
- `Simulation`: API-driven or custom simulation module
- `Infographic`: read-only structured JSON blocks for modern visual guidance

## Content Contract

Core files:
- `classes/index.json`
- `classes/<lesson-folder>/meta.json`
- `classes/<lesson-folder>/slides.md` (optional when `hide_slides: true`)
- `classes/<lesson-folder>/infographic.json` (optional, only when `meta.json.infographic_file` is set)

Important metadata keys:
- `title`: lesson title in navigator/header
- `api_route`: simulation endpoint route (simulation mode)
- `simulation_module`: custom simulation frontend module key (optional)
- `infographic_file`: infographic JSON filename, for example `infographic.json`
- `hide_slides`: set `true` to hide Slides tab for infographic-only lessons

## Workflow

1. Detect the lesson contract before editing.
- Find `classes/index.json`.
- Confirm lesson folder pattern (`meta.json`, `slides.md`, optional `infographic.json`).
- Confirm simulation discovery pattern (`app/simulations/*.py` with exported `router`).
- Confirm tab behavior in frontend (`Slides`, `Infographic`, `Simulation`).

2. Create or update lesson content files.
- Create `classes/<lesson-folder>/meta.json`.
- **Naming Convention**: Use `Class X: Title` for lecture lessons and `Class X Lab: Title` for lab/practical lessons. 
- Create `slides.md` unless this lesson is intentionally infographic-only.
- Add lesson folder to `classes/index.json`.

3. Choose delivery mode intentionally.
- `Slides-only`: no `api_route`, no `infographic_file`.
- `Simulation`: add `api_route` and optional `simulation_module`.
- `Infographic`: add `infographic_file`, optionally `hide_slides: true`.
- Hybrid: combine slides + infographic + simulation as needed.

4. Add simulation backend only when truly needed.
- Create `backend/app/simulations/<lesson_file>.py`.
- Export `router = APIRouter()`.
- Implement endpoint matching `meta.json.api_route`.
- Keep read-only guidance lessons free of unnecessary backend logic.

5. Add infographic content when needed.
- Create `classes/<lesson-folder>/<infographic_file>` (JSON).
- Keep it one-way/read-only unless a product requirement explicitly needs learner input capture.
- **Markdown Support**: The `tasks` array in `part_block` supports full Markdown (bold, code, links).
- Prefer grouped `part_block` sections for focusable lesson structure.

6. Validate behavior end-to-end.
- Lesson appears in sidebar.
- Metadata title renders correctly.
- Correct tabs appear for that lesson mode.
- Slides render if enabled.
- Infographic renders with dark/light mode readability.
- Simulation works only when configured.

## Infographic Schema (Current)

Supported block `type` values:
- `hero`
- `key_value_grid`
- `callout`
- `bullet_list`
- `ordered_list`
- `table`
- `csv_table`
- `formula_card`
- `part_block`
- `quote`
- `divider`

`part_block` recommended shape:
- `eyebrow`, `title`, `description`
- `tasks`: ordered list
- `table`: optional structured table
- `formulas`: array of formula cards
- `hints`: bullet list
- `summaryTemplate`: optional executive summary template text
- `open_by_default`: optional boolean for initial expand state

## Templates

Use existing template assets and adapt:
- Lesson metadata: `assets/templates/lesson/meta.generic.json`
- Lesson slides: `assets/templates/lesson/slides.md`
- Backend simulation module: `assets/templates/backend/simulation_module.py`
- Custom frontend simulation component: `assets/templates/frontend/CustomSimulation.jsx`
- Metadata for custom simulation mode: `assets/templates/lesson/meta.custom-simulation.json`

For infographic mode, model your file from an existing working lesson infographic JSON and keep block schema compatible with the renderer.

## Advanced Rules

- Keep lessons declarative in content files.
- Keep routing auto-discovery intact; avoid hardcoded route registration when autoload exists.
- Do not add backend endpoints for visualization-only lessons.
- Prefer one-way instructional UX for instructor-to-student delivery unless requirements say otherwise.
- Ensure dark mode readability for infographic text and formula/callout cards.
- Use collapsible `part_block` structure for long labs to improve focus.

## Fast Checklist

- Added lesson folder + `meta.json`
- Added `slides.md` and/or `infographic.json` based on mode
- Updated `classes/index.json`
- Added simulation module only if needed
- Matched `api_route` and `simulation_module` only when simulation mode is enabled
- Set `infographic_file` and `hide_slides` intentionally for infographic mode
- Verified tabs and rendering in light/dark mode
