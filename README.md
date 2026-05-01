# Treemapper

A lightweight T-shirt sizing visualizer. Enter a two-level bullet list of swimlanes and sublanes, assign sizes, and see them laid out as a squarified treemap with color coding.

This repo serves two purposes:
1. **Standalone app** — a self-contained Vite + React tool for sizing work at a glance
2. **Core library** — the canonical source for `SizingView` and shared types, consumed by downstream apps (e.g. koko-planner) as a git dependency

---

## Running the standalone app

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |

### Usage

1. Click **Add Data** to open the data editor.
2. Enter your structure in plain text:
   - Plain lines → **swimlanes** (top-level groups)
   - Lines starting with `- ` → **sublanes** under the most recent swimlane
3. Click **Apply** — the treemap renders.
4. Click any sublane cell to cycle through T-shirt sizes (S → M → L → XL → XXL → XS → XXS → unset).
5. Use the color picker on a swimlane label to change its color family; sublane cells show a shade picker in their menu.
6. All data (text, sizes, colors) is saved to `localStorage` — no backend required.

**Example input:**
```
Platform
- Infrastructure
- Core Services

Product
- Mobile App
- Web App

Research
```

---

## Repo structure

```
src/
├── core/                    ← Library exports (consumed by downstream apps)
│   ├── index.ts             ← Public API
│   ├── SizingView.tsx       ← The canonical treemap component
│   ├── SwimlaneFilter.tsx   ← Controlled swimlane filter dropdown
│   ├── types.ts             ← Shared types (Swimlane, TimelineBar, EntityMetadata, TShirtSize)
│   └── color-families.ts   ← Color families + shade system
└── app/                     ← Standalone app only (not exported)
    ├── App.tsx              ← Root component, state management, data wiring
    ├── main.tsx             ← Vite entry point
    ├── components/
    │   └── DataModal.tsx    ← Bullet-list data entry UI
    └── lib/
        ├── parse-bullets.ts ← Parses plain-text input into swimlanes/sublanes
        └── storage.ts       ← localStorage read/write
```


---

## What belongs in core (`src/core/`)

Core contains anything that a downstream app should import and build on. The bar for adding something to core: would a completely different app (different data source, different backend, different domain) still want this?

**In scope for core:**
- `SizingView` component — the squarified treemap visualization, size cycling, color controls, tile layout algorithm
- `SwimlaneFilter` component — controlled dropdown for selecting which swimlanes are visible
- `Swimlane` and `TimelineBar` types — minimal, date-free entity types that carry optional metadata
- `EntityMetadata` type — generic key-value metadata schema for downstream panels
- `TShirtSize`, `SIZE_POINTS`, `SIZE_SEQUENCE` — sizing primitives
- `COLOR_FAMILIES`, shade system — color palette and shade indices

**Out of scope for core (belongs in downstream apps):**
- Data sourcing — how swimlanes/sublanes are created (bullet text, Slack, CSV, API, etc.)
- Persistence — localStorage, Redis, any backend
- Domain-specific metadata — dates, milestones, priorities, assignees, status fields
- Rich custom panels — downstream apps can replace the built-in panel entirely via `onOpenPanel` (see below)
- Authentication, routing, multi-view layouts

---

## Core types

```typescript
// Minimal entity types — no dates, no domain fields
interface Swimlane {
  id: string;
  name: string;
  color: string;
  metadata?: EntityMetadata;   // optional — used by built-in panel
}

interface TimelineBar {        // "sublane" in practice
  id: string;
  swimlaneId: string;
  name: string;
  color: string;
  metadata?: EntityMetadata;
}

// Generic metadata rendered by the built-in panel
interface MetaField {
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: (newValue: string) => void;
}

interface EntityMetadata {
  description?: string;
  fields?: MetaField[];
  sections?: { title: string; fields: MetaField[] }[];
}

type TShirtSize = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
```

---

## SizingView props

```typescript
interface SizingViewProps {
  // Required
  swimlanes: Swimlane[];           // pass pre-filtered array to show a subset
  bars: TimelineBar[];             // pass pre-filtered array to match swimlanes
  sizes: Record<string, TShirtSize | null>;
  onSizeChange: (barId: string, size: TShirtSize | null) => void;
  swimlaneFamilyIndices: Record<string, number>;   // which COLOR_FAMILY per swimlane
  sublaneShadeIndices: Record<string, number>;     // which shade (0–4) per sublane
  onSwimlaneColorChange: (swimlaneId: string, familyIndex: number) => void;
  onSublaneShadeChange: (sublaneId: string, shadeIndex: number) => void;

  // Optional
  onResetSizes?: () => void;                       // shows reset button if provided

  // Panel override (see "Panel system" below)
  onOpenPanel?: (view: { type: 'swimlane' | 'sublane'; id: string }) => void;
  selectedSwimlaneId?: string;                     // renders selection ring on this swimlane
  selectedBarId?: string;                          // renders selection ring on this sublane
  nameOverrides?: { sublanes: Record<string, string> };
}
```

---

## Panel system: built-in vs override

`SizingView` fires a callback when a user clicks a swimlane label or chooses "See details" on a sublane tile. The default behavior and the override pattern differ based on whether `onOpenPanel` is provided:

| `onOpenPanel` provided? | What happens on click |
|---|---|
| No | SizingView handles it internally (no panel — the swimlane label is non-interactive) |
| Yes | SizingView calls the callback; host app owns the panel entirely |

**Downstream apps that want a rich detail panel provide `onOpenPanel`:**

```typescript
// No custom panel — swimlane labels are non-interactive
<SizingView swimlanes={...} bars={...} ... />

// Custom panel — SizingView fires callback, host app takes over
<SizingView
  swimlanes={...}
  bars={...}
  onOpenPanel={({ type, id }) => {
    // open your own Sheet, drawer, modal, etc.
  }}
  selectedSwimlaneId={panelState?.type === 'swimlane' ? panelState.id : undefined}
  selectedBarId={panelState?.type === 'sublane' ? panelState.id : undefined}
  ...
/>
```

`selectedSwimlaneId` and `selectedBarId` highlight the entity that is currently open in the host panel — SizingView renders a visible selection ring around it.

This is how `koko-planner` integrates: it passes `onOpenPanel` and renders its own rich Slack-aware panel (dates, milestones, assignees, descriptions) outside of `SizingView`.

Even when using the custom panel, you can still populate `entity.metadata` on your swimlane/sublane objects. This creates a migration path if you later want to consolidate shared fields back into a built-in panel.

---

## Swimlane filtering

`SizingView` renders whatever swimlanes and bars it receives — it has no internal concept of filtering. Filtering is always managed outside the component and applied before the data is passed in.

Core exports a `SwimlaneFilter` component for this:

```typescript
import { SwimlaneFilter } from 'treemapper-core';
```

```typescript
// SwimlaneFilter is a controlled component
<SwimlaneFilter
  swimlanes={allSwimlanes}
  selectedIds={selectedSwimlaneIds}
  onChange={setSelectedSwimlaneIds}
/>
```

The host app then filters before passing to `SizingView`:

```typescript
const hasSwimlaneFilter = selectedSwimlaneIds.length > 0;
const selectedIdSet = new Set(selectedSwimlaneIds);

const filteredSwimlanes = hasSwimlaneFilter
  ? allSwimlanes.filter(sl => selectedIdSet.has(sl.id))
  : allSwimlanes;

const filteredBars = hasSwimlaneFilter
  ? allBars.filter(b => selectedIdSet.has(b.swimlaneId))
  : allBars;

<SizingView swimlanes={filteredSwimlanes} bars={filteredBars} ... />
```

`SwimlaneFilter` renders a dropdown of checkboxes with an "All swimlanes" clear option. Downstream apps can use it as-is or build a richer replacement (koko-planner replaces it with a custom dropdown that also encodes selections into the URL as `?lanes=...`).

---

## Using treemapper-core as a dependency

### Setup

**During local development** (when you're working on both repos at the same time), reference treemapper directly from disk. Changes here are reflected immediately when you restart the downstream app's dev server — no install step needed.

```json
"treemapper-core": "file:../treemapper"
```

**For production / shared environments**, reference a specific commit on GitHub. npm pins to the commit hash at install time, so the downstream app is stable until you explicitly update it.

```json
"treemapper-core": "github:kallo-byte/treemapper"
```

If the consuming app is Next.js, also add to `next.config.ts`:

```typescript
transpilePackages: ['treemapper-core']
```

Then import:

```typescript
import { SizingView, COLOR_FAMILIES } from 'treemapper-core';
import type { Swimlane, TimelineBar, TShirtSize, EntityMetadata } from 'treemapper-core';
```

---

### How updates flow from treemapper to a downstream app

Changes you make and push to this repo do **not** automatically appear in downstream apps. npm pins to the commit hash that was current when the downstream app last ran `npm install`. This is intentional — it means a breaking change here won't silently break a deployed app.

To adopt new changes in a downstream app:

```bash
# In the downstream app repo (e.g. koko-planner):
npm install github:kallo-byte/treemapper
```

This resolves to the latest commit, updates `package-lock.json`, and from there a push to that repo triggers a normal Vercel redeploy.

**Typical workflow when developing across both repos:**

| Phase | treemapper reference | How changes arrive |
|---|---|---|
| Local dev | `file:../treemapper` | Instantly on dev server restart |
| Staging / production | `github:kallo-byte/treemapper` | Manually run `npm install` in the downstream app, then push |

**What this means in practice:** if you update the rectangle layout algorithm in treemapper and push it, koko-planner's production deploy is unaffected until you go into koko-planner, run `npm install github:kallo-byte/treemapper`, and push that change. This gives you a deliberate gate between core changes and downstream deploys.

---

## Architecture plan

Full context on the consolidation of this repo and `koko-planner` is documented in:

**`koko-planner` repo → `docs/treemapper-architecture-plan.md`**

That document covers the full implementation plan, the complete file-by-file change list, and verification steps.

---

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 6](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com) (Dialog, DropdownMenu, AlertDialog, Sheet)
- [Lucide React](https://lucide.dev) icons
