# SizingView — Component Documentation
### Portfolio Deep-Dive

---

## What this artifact is and why it exists

Component documentation is the argument for why a component was designed the way it was. A Storybook file shows what a component *does* — its states, its edge cases, its API surface. This document explains the *why*: the design decisions behind each prop, the behavioral rules that aren't obvious from the code, and the tradeoffs I made.

It's also the artifact that bridges design and engineering. A designer reading this should understand exactly how the component behaves and what props they can influence. An engineer should understand why specific thresholds and behaviors exist. A future me should be able to pick this up six months later and not have to re-derive it from the source.

---

## What SizingView is

`SizingView` is a **squarified treemap** for T-shirt sizing work items in a project planning session.

It answers the question: *relative to each other, how big is each piece of work?*

It doesn't track time, deadlines, or dependencies. It's a single-purpose tool for a single moment: a team standing in front of a visualization and agreeing, collectively, on the rough scale of everything they're about to build.

---

## Component anatomy

```
┌──────────────────────────────────────────────────────────────────────┐
│  Canvas (bg-gray-50, position: relative)                             │
│  ┌──────────────────────────────────┐  ┌────────────────────────────┐
│  │  Swimlane region (sl-cai)        │  │  Swimlane region (sl-oai)  │
│  │  ┌─────────────┐ ┌────────────┐ │  │  ┌──────────────────────┐  │
│  │  │  TileCell   │ │  TileCell  │ │  │  │  TileCell (XL item)  │  │
│  │  │  "Spanish"  │ │  "Risk-    │ │  │  │  "ABC SSI"           │  │
│  │  │  M          │ │   tiered"  │ │  │  │                      │  │
│  │  └─────────────┘ │  pathway"  │ │  │  └──────────────────────┘  │
│  │  ┌─────────────┐ │  XL        │ │  │  ┌──────────┐ ┌─────────┐  │
│  │  │  TileCell   │ └────────────┘ │  │  │ TileCell │ │TileCell │  │
│  │  │  (unset)    │ ┌────────────┐ │  │  │ M        │ │ XS      │  │
│  │  │  (ghost)    │ │  TileCell  │ │  │  └──────────┘ └─────────┘  │
│  │  └─────────────┘ │  S         │ │  └────────────────────────────┘
│  │                  └────────────┘ │
│  │  [C.AI ▾]                       │  [OpenAI ▾]
│  └──────────────────────────────────┘
│                                                                      │
│  Swimlane rings (3px white inset) provide visual separation         │
└──────────────────────────────────────────────────────────────────────┘
│ Click any cell to cycle: S · M · L · XL · XXL · XS · XXS · unset   │
└──────────────────────────────────────────────────────────────────────┘
```

Three layers of structure:
1. **Canvas** — the full viewport, sized by the container via `ResizeObserver`
2. **Swimlane regions** — computed by the outer squarified treemap pass, proportional to total points in the lane
3. **TileCell elements** — computed by the inner squarified treemap pass within each swimlane region

---

## The layout algorithm

The squarified treemap algorithm (Bruls et al., 1999) divides a rectangle into sub-rectangles with aspect ratios as close to 1:1 as possible, given a set of input values. The key property is that it minimizes the "worst ratio" in each row as it fills the space.

The two-pass architecture here is a design choice:

> **Pass 1:** Squarify swimlanes by their total point value → each swimlane gets a region.
>
> **Pass 2:** For each swimlane region, squarify its bars by their individual point values → each bar gets a tile inside its lane.

This means swimlane areas are proportional to the total effort *estimated within them*, and tile areas are proportional to the item's effort *relative to its siblings*. A swimlane with one XXL item and a swimlane with eight M items might be the same canvas area — which is correct, because both represent 32 points of estimated work.

**The size scale** (`XXS=0.5, XS=1, S=2, M=4, L=8, XL=16, XXL=32`) doubles at each step. This is deliberate: a doubling scale means relative area ratios are perceptually intuitive. If you look at two adjacent tiles and one is twice as big, it's XL vs L — exactly one step. A linear scale (XS=1, S=2, M=3...) would not produce this clarity because the doubling compresses high-end sizes visually.

**Unset items** receive 0.25 points — half of XXS. They participate in the layout (they have visible area) but their ghost appearance (15.7% opacity background) communicates that they haven't been sized yet.

---

## The label system

One of the more complex pieces of the component is the label display logic. TileCell has three label states:

| Condition | Label shown |
|---|---|
| `tile.w ≥ 72 AND tile.h ≥ 44` | Full label: item name + size badge (or "Click to size") |
| `tile.w ≥ 18 OR tile.h ≥ 18` (but not full) | Size badge only (or nothing if unset) |
| Both dimensions < 18px | No label |
| `tile.w ≥ 28 AND tile.h ≥ 28` | `⋯` menu visible |

These thresholds were determined empirically — the component was run at a range of densities until the labels stopped feeling useful or started feeling crowded. The specific values encode a judgment about what's worth showing at small sizes.

The padding inside the label is: `max(4px, 4% of tile dimension)`. This means small tiles get a flat 4px minimum pad, while larger tiles get generous proportional padding that doesn't waste space. The percentage was chosen because it preserves visual consistency across very different tile sizes.

**The "Click to size" hint** only appears on unset tiles that are large enough to show the full label. The copy is intentionally imperative ("Click to size", not "Unset" or "No size") because in a sizing session, the state you want to move toward is *not* unset. The label prompts action.

The label's background behavior on hover is also intentional: on hover of an unset tile, the label area briefly shows the cell's color as its background. This serves as a "preview" of what the tile will look like when sized — a small affordance that makes the click feel less surprising.

---

## Color architecture

The color system has three levels of control:

**Level 1 — Color family (per swimlane)**
Each swimlane is assigned one of 8 color families (Teals, Golds, Purples, Greens, Blues, Oranges, Greys, Reds). This is the hue group for all tiles in that lane.

**Level 2 — Shade (per bar)**
Each bar can be assigned one of 5 shades within its swimlane's family, ranging from deep/dark (index 0) to muted/lighter (index 4). The default is shade index 1, which provides the best visibility at typical tile sizes.

**Level 3 — Opacity (per state)**
Tile opacity is controlled by a small set of constants:
- Unset tiles: `hex + '28'` (15.7% opacity) — clearly ghosted
- Selected ring: `rgba(255,255,255,0.4)` — soft second ring
- Label text: `rgba(255,255,255,0.9)` — high contrast but not harsh

The reason color is stored externally (in `swimlaneFamilyIndices` and `sublaneShadeIndices`, passed as props) rather than in the component's state is that the parent application needs to persist these choices. The roadmap tool persists them to Vercel KV; a standalone app might use `localStorage`. The component is agnostic about persistence.

---

## Props, with rationale

**`sizes: Record<string, string>`**
Not `Record<string, TShirtSize>` — it accepts strings so the parent can store sizes in various formats (including coming from a Slack List API) without needing to validate before passing. The component handles unknown size strings gracefully (they're treated as unset).

**`visibleSwimlaneIds?: Set<string>`**
When provided, only visible swimlanes are rendered *but the treemap layout is still computed for all swimlanes*. The visible region is then re-centered in the available canvas using a translate transform. This means swimlane areas are relative to the full dataset, not just the visible subset — which preserves the meaning of tile area across filter changes.

An alternative design would re-compute the layout with only visible bars, making each visible tile proportionally larger. I chose not to do this because it would change the meaning of area mid-session. If you filter to one swimlane, you want to see that lane's items at the same *relative* scale as when all lanes were visible — not inflated to fill the screen.

**`onOpenPanel?: (view: { type: 'swimlane' | 'sublane'; id: string }) => void`**
Optional. When provided, two behaviors change:
1. The swimlane label becomes a clickable button (instead of a non-interactive `<span>`)
2. "See details" appears at the top of each tile's dropdown menu

The panel itself is the consumer's responsibility — `SizingView` doesn't know what a panel looks like. This keeps the component composable. The roadmap app in `koko-planner` uses this to open a side sheet with work item details; a different consumer could use it to open a modal or navigate to a new page.

**`nameOverrides?: { sublanes: Record<string, string> }`**
Allows the consumer to display a different name for a bar without changing the underlying data. In `koko-planner`, this is used to show the swimlane's `subLaneName` instead of the full `bar.name` when sublane grouping is active. The override doesn't affect the `bar.name` used anywhere else.

---

## Accessibility

The current state of accessibility in `SizingView` is functional but not complete.

What's in place:
- `TileCell` has `role="button"`, `tabIndex={0}`, and keyboard handling (`Enter` and `Space` cycle the size)
- The `title` attribute provides a tooltip: `"${displayName} · ${size ?? 'unset'} — click to change"`
- The swimlane label button has a `title` with the swimlane name

What's missing:
- No `aria-label` on TileCell that describes the current size or action
- No `aria-pressed` or `aria-selected` on selected tiles
- The squarified layout uses absolute positioning, which screen readers encounter in DOM order rather than visual order — and DOM order is the treemap computation order, not alphabetical or logical order
- Color is used as the primary signal for swimlane grouping (no pattern or shape alternative)

A complete accessibility pass would add live region announcements when sizes change, and revisit whether the treemap paradigm itself is appropriate for keyboard/screen reader users (it may require an alternate table view).

---

## What I'd build next

**1. An empty state.** Currently, if `bars` is empty, the component renders a blank gray rectangle. A real empty state would communicate *why* it's empty and what to do: "No work items yet. Add items to your work tracker to start sizing."

**2. Animation on initial load.** The tiles currently appear instantly. An entrance animation (tiles fading in and expanding from their final positions) would help users understand the layout before they start clicking. The `transition` CSS already handles size-change animations; the initial load just needs a brief opacity fade.

**3. A zoom/scale mode.** For high-density sessions with 50+ items, most tiles become too small to label. A zoom feature — either explicit (button) or implicit (scroll/pinch) — would let teams focus on one region at a time. The `visibleSwimlaneIds` prop is already partway there for the swimlane level.

**4. Export.** A PNG or SVG export of the current state, with a legend, would let teams share the sizing result without requiring access to the tool. The roadmap app in `koko-planner` implemented this with `html2canvas`, but it's currently hidden pending a Slack API scope upgrade for direct-to-channel posting.
