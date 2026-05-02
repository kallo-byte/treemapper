# Information Architecture — treemapper-core
### Full-Fidelity Working Document

**Product:** treemapper / SizingView component
**Scope:** Standalone app + embedded component (koko-planner integration)
**Status:** v1.0 — current implemented state
**Last reviewed:** 2026-05-01

---

## Purpose of this document

This IA doc is the authoritative reference for:
- What entities the system knows about and how they relate
- What actions are available at each scope
- What states the system can be in
- How the component and its consuming app divide responsibilities

Use this when: making decisions about adding new features, resolving ambiguity about where state should live, or onboarding a new engineer to the data model.

---

## 1. Entity Model

### Core entities

```
Workspace
└── Swimlane (1..n)
    └── Bar / Work Item (1..n per swimlane)
        └── Size (0..1 per bar) — TShirtSize | null
```

| Entity | Where defined | Owned by | Persisted by |
|---|---|---|---|
| Swimlane | `types.ts: Swimlane` | Consumer app | Consumer app |
| Bar | `types.ts: TimelineBar` | Consumer app | Consumer app |
| Size | `sizes: Record<barId, string>` | Consumer app | Consumer app |
| Swimlane color family | `swimlaneFamilyIndices` | Consumer app | Consumer app (Vercel KV in koko-planner) |
| Bar shade index | `sublaneShadeIndices` | Consumer app | Consumer app |
| Canvas dimensions | `dims: {w, h}` state | `SizingView` | Not persisted (recomputed on mount/resize) |
| Tile layout | computed | `SizingView` | Not persisted (recomputed from sizes + dims) |

**Key constraint:** `SizingView` owns *zero* persistent state. Everything that matters between sessions flows in as props or is managed by the consumer. This is intentional — the component is a pure visualization layer.

### Entity relationships

```
Swimlane ──has many── Bar
Bar ──has zero or one── Size (TShirtSize)
Bar ──belongs to── one Swimlane

Swimlane ──has one── ColorFamily (index 0–7 into COLOR_FAMILIES)
Bar ──has one── ShadeIndex (index 0–4 within swimlane's family)
Bar.color = COLOR_FAMILIES[familyIndex].bars[shadeIndex]
```

---

## 2. Data Flow

### Props in / events out

```
Consumer app
    │
    │ props: swimlanes, bars, sizes, swimlaneFamilyIndices,
    │        sublaneShadeIndices, visibleSwimlaneIds?,
    │        selectedSwimlaneId?, selectedBarId?, nameOverrides?
    ▼
SizingView
    │
    │ events: onSizeChange(barId, TShirtSize | null)
    │         onSwimlaneColorChange(swimlaneId, familyIndex)
    │         onSublaneShadeChange(barId, shadeIndex)
    │         onOpenPanel?({ type, id })
    │         onResetSizes?()
    ▼
Consumer app (updates state, persists, re-renders)
```

### Derived data (computed inside SizingView)

The component derives two things from incoming props:

1. **Swimlane point totals** — `bars.filter(b => b.swimlaneId === sl.id && sizes[b.id]).reduce(sum of SIZE_POINTS)`
2. **Tile layouts** — squarified treemap computation over the point values and canvas dimensions

Neither is stored in `useState`. Both recompute on every render. This is intentional: the squarification is fast (O(n) for typical sizes) and correctness is more important than memoization for this use case.

---

## 3. Action Taxonomy

### Scoped to a single bar (tile)

| Action | Trigger | Effect | Event emitted |
|---|---|---|---|
| Cycle size | Click tile body | Advances through SIZE_SEQUENCE | `onSizeChange(barId, nextSize)` |
| Set specific size | Menu → Size → [option] | Sets to chosen TShirtSize | `onSizeChange(barId, size)` |
| Unset size | Menu → Size → Unset | Removes from `sizes` record | `onSizeChange(barId, null)` |
| Change shade | Menu → Shade → [option] | Changes bar's shade within family | `onSublaneShadeChange(barId, idx)` |
| Open detail panel | Menu → See details | Triggers consumer panel open | `onOpenPanel({ type:'sublane', id:barId })` |

### Scoped to a swimlane

| Action | Trigger | Effect | Event emitted |
|---|---|---|---|
| Change color family | Swimlane ⋯ → Color → [family] | Changes all tiles' hue family | `onSwimlaneColorChange(swimlaneId, familyIdx)` |
| Set all to size | Swimlane ⋯ → Reset lane sizes → [size] | Calls onSizeChange for every bar in lane | n × `onSizeChange(barId, size)` |
| Unset all in lane | Swimlane ⋯ → Reset lane sizes → Unset all | Calls onSizeChange(null) for every bar | n × `onSizeChange(barId, null)` |
| Open swimlane panel | Click swimlane label (when `onOpenPanel` provided) | Triggers consumer panel open | `onOpenPanel({ type:'swimlane', id:swimlaneId })` |

### Global (passed from consumer)

| Action | How triggered | Effect |
|---|---|---|
| Filter visible lanes | Consumer updates `visibleSwimlaneIds` | Only specified lanes rendered; region re-centered |
| Reset all sizes | Consumer calls `onResetSizes` | Consumer clears `sizes` record |
| Select lane/bar | Consumer updates `selectedSwimlaneId` / `selectedBarId` | Visual ring highlights applied |

---

## 4. State Machine — TileCell

```
        UNSET
          │
          │  click / keyboard Enter or Space
          │  → cycleSize(null) = 'S'
          ▼
         [S]  ←── menu: set to S
          │
          │  click → 'M'
          ▼
         [M]  ←── menu: set to M
          │
          │  click → 'L'
          ▼
         [L]  ...
          │
          │  click → 'XL'
          ▼
        [XL]
          │
          │  click → 'XXL'
          ▼
       [XXL]
          │
          │  click → 'XS'
          ▼
        [XS]
          │
          │  click → 'XXS'
          ▼
       [XXS]
          │
          │  click → null (UNSET)
          ▼
        UNSET  (full cycle)

SIZE_SEQUENCE = [null, 'S', 'M', 'L', 'XL', 'XXL', 'XS', 'XXS']
Note: XS and XXS appear at the end of the cycle, not the beginning.
This is intentional: small sizes are used less frequently in most
planning sessions and shouldn't be the first options encountered.
```

**Visual states of a tile:**

| State | Background | Label |
|---|---|---|
| Unset, normal | `cellColor` at 15.7% opacity | "Click to size" (if tile large enough) |
| Unset, hover | `cellColor` at 15.7% + label bg preview | "Click to size" with color bg |
| Sized, normal | `cellColor` at 100% | Name + size badge |
| Sized, selected | `cellColor` + inset white ring | Name + size badge |
| Sized, hover | `cellColor` + `brightness-90` (10% darker) | Name + size badge |
| Sized, active | `cellColor` + `brightness-75` (25% darker) | Name + size badge |

---

## 5. Label Visibility Rules

```
showFullLabel = tile.w >= 72 AND tile.h >= 44
showSizeOnly  = NOT showFullLabel AND (tile.w >= 18 OR tile.h >= 18)
showMenu      = tile.w >= 28 AND tile.h >= 28

Label content when showFullLabel:
  - isUnset: Name + "Click to size"
  - isSized: Name + size badge (e.g. "XL")

Label content when showSizeOnly AND NOT showFullLabel:
  - isSized: size badge only (e.g. "XL")
  - isUnset: nothing (a tiny ghost tile needs no copy)
```

These dimensions are in pixels at the component's rendered size (not CSS pixels; the component fills its container via ResizeObserver).

---

## 6. Filtering Behavior

When `visibleSwimlaneIds` is provided:

1. All swimlanes are computed in Pass 1 (full treemap layout over all data)
2. Only visible swimlanes are rendered
3. The bounding box of visible tiles is computed (`minX, minY, maxX, maxY`)
4. A CSS `translate()` centers the visible region in the canvas

**What this means:**
- Tile area is always relative to the full dataset, never the filtered subset
- Zoom/scale is not applied — visible tiles render at the same size as they would in the full view
- This preserves the meaning of "relative size" across filter state changes

---

## 7. Consuming Application Responsibilities

`SizingView` is deliberately narrow. The consuming app is responsible for:

| Concern | In koko-planner | In standalone app |
|---|---|---|
| Loading bar/swimlane data | Slack Lists API via `/api/slack-list` | Parsed from `localStorage` bullet-point input |
| Persisting sizes | Vercel KV (`/api/roadmap-colors`) | `localStorage` |
| Persisting color choices | Vercel KV (`/api/roadmap-colors`) | `localStorage` |
| The "Reset all sizes" button | Hidden (pending UX decision) | Rendered with confirmation dialog |
| The detail panel | `Sheet` component (side sheet) | Not implemented |
| Filter controls | `SwimlaneFilter` component | Not implemented |
| Export | PNG via html2canvas (hidden) | Not implemented |

---

## 8. Open Questions

These are unresolved design decisions. Each is a candidate for a future IA update.

**Q1: Should swimlane area be total points or bar count?**
Currently: total points (sum of SIZE_POINTS for all sized bars, min 1).
Alternative: bar count (unaffected by sizes).
Impact: With current behavior, a swimlane with one XXL item is visually equivalent to one with eight M items (~32pts each). Is this the right model, or should swimlane area reflect project scope (number of items) rather than estimated effort?

**Q2: Should unset bars affect swimlane area?**
Currently: unset bars contribute 0 points to swimlane area (they render at 0.25pts within the lane but don't affect the outer layout).
Alternative: Give unset bars a default size assumption (e.g., M=4pts) for outer layout purposes.
Impact: Swimlanes with many unsized items would appear proportionally smaller than their true scope. The current behavior is honest about uncertainty; the alternative would make unsized lanes more visible.

**Q3: Where does "view a single item's full details" belong?**
Currently: via `onOpenPanel` (consumer's responsibility).
The component has no opinion about what the panel contains, who can edit it, or whether it's modal.
This is probably correct for a library component but creates inconsistency between the standalone app (which has no panel) and koko-planner (which does).

**Q4: Is the SIZE_SEQUENCE click-cycle the right primary interaction?**
The cycle goes: null → S → M → L → XL → XXL → XS → XXS → null.
This means starting from unset, you cycle through from small to large before reaching XS/XXS.
In practice, most items in a planning session land between S and XL. XS and XXS are rare and deliberately at the end of the cycle. Is this the right prioritization?
