# Design Tokens — treemapper-core
### Portfolio Deep-Dive

---

## What this artifact is and why it exists

A design token system is the layer between a designer's decisions and the code that implements them. Without tokens, design decisions are scattered as literal values throughout a codebase — `'12px'` in one file, `'rgba(255,255,255,0.9)'` in another, `'ease-in-out'` in a third — with no record of what those values mean or how they relate to each other.

With tokens, every value has a name, a location, and a purpose. Changing the label font size from `12px` to `13px` means editing one entry in one file. Understanding why a tile border is `rgba(255,255,255,0.25)` requires only reading the semantic token where it's defined.

This document shows the token system I designed for `treemapper-core`. It covers what decisions I made, why, and what the system enables that literal values can't.

---

## What was already there: `color-families.ts`

Before designing the full token system, the codebase had a well-structured color system in `color-families.ts`. It's worth describing what it already got right, because the token system builds on it rather than replacing it.

`color-families.ts` defines 8 named color families (Teals & Aquas, Golds & Yellows, Purples, etc.). Each family has:
- 5 ordered shades with semantic names (`Petrol`, `Teal`, `Cyan`, `Turquoise`, `Seafoam`)
- 2 background tints (default and weekend)

The shade ordering isn't arbitrary — the shades move from deep/dark (index 0) to muted/lighter (index 4), and `DEFAULT_SHADE_INDEX = 1` (the second shade) is the default because it's visually prominent without being oppressive at small sizes. This is a thought-through design decision already embedded in the system.

What `color-families.ts` didn't cover: anything outside the color domain. No spacing, no typography, no motion, no border-radius. Those values existed as magic numbers spread through the component.

---

## The three-tier structure

The token system I designed has three levels:

```
PRIMITIVE — raw values with no implied meaning
    ↓
SEMANTIC — values named by their role, not their appearance
    ↓
COMPONENT — semantics as consumed (mostly implicit in this system)
```

### Level 1: Primitives

Primitives are the vocabulary. They name raw values but don't say what to do with them.

**Color primitives** translate the `COLOR_FAMILIES` array into named constants. For example, the Teal family's five shades become:

```ts
color.teal.shade.deep    = '#2a4d52'  // bars[0]
color.teal.shade.default = '#2e7a7a'  // bars[1] — what DEFAULT_SHADE_INDEX points to
color.teal.shade.mid     = '#3d8a9e'  // bars[2]
color.teal.shade.soft    = '#4a9691'  // bars[3]
color.teal.shade.muted   = '#5a8075'  // bars[4]
```

**Spacing primitives** use a 4px base unit. This is the most common convention in modern design systems (Tailwind's default, Material Design, etc.) and it means that any two adjacent spacing values will always be a multiple of 4.

**Opacity primitives** are the most novel part. The component uses several fractional alpha values that appear as hex suffixes in color strings (`cellColor + '28'`) or in rgba functions. Without documenting them, they look like magic numbers. With primitives:

```ts
opacity.tile.unsetBg  = 0.157   // 28/255 — what '28' hex suffix means
opacity.tile.label    = 0.90    // primary label text
opacity.tile.labelDim = 0.50    // "Click to size" secondary hint
```

Now `${cellColor}28` has a documented meaning: *this is the unset tile background, at 15.7% opacity of the tile's color*.

**Motion primitives** capture the two animation durations in the component. The tile layout transition is `300ms ease-in-out` — tiles animate smoothly when sizes change and the squarified layout recomputes. This is a user-experience decision: the animation communicates that the layout is data-driven, not static.

### Level 2: Semantics

Semantics are the grammar. They assign the vocabulary to specific roles.

The key semantic decisions:

**`tile.selected.boxShadow`** — The selected state uses two concentric inset shadows: a sharp 2px white ring and a wider 4px semi-transparent ring. This gives a "selected" visual that works on any tile color — it doesn't rely on a specific color for the ring because the white-on-color combination always produces visible contrast.

```ts
tile.selected.boxShadow = 'inset 0 0 0 2px white, inset 0 0 0 4px rgba(255,255,255,0.4)'
```

**`tile.label` threshold semantics** — This was the most subtle design decision to document. The label inside a tile has three states depending on tile dimensions:

```
Tile ≥ 72×44px: show full label (name + size badge or "Click to size")
Tile ≥ 18px in either dimension: show size badge only
Tile < 18px in both dimensions: show nothing
```

These thresholds weren't pulled from a spec — they were found empirically by watching the component at different data densities. Documenting them as named semantics (`tile.label.fullLabelMinWidth: 72`) means the next person to work on the component understands that these numbers are *thresholds with a reason*, not arbitrary pixel values.

**`swimlane.ring`** — The swimlane region has a border ring even in the non-selected state (`inset 0 0 0 3px white`). This is the white gap between adjacent swimlane groups, giving the layout visual organization. The selected state adds a second, wider ring with 35% opacity. Naming both states makes the visual hierarchy explicit: the ring is always there, selection just makes it louder.

### The size scale as semantic token

The `SIZE_POINTS` doubling scale (`XXS: 0.5, XS: 1, S: 2, M: 4, L: 8, XL: 16, XXL: 32`) is a design decision that deserves documentation as a token because it's not just data — it's a visual language choice.

The doubling means that an XL item gets exactly twice the canvas area of an L item. This makes relative size intuitive at a glance: you can look at two adjacent tiles and tell whether the gap between them is "one size step" or "two." A linear scale (XS=1, S=2, M=3...) would not produce this perceptual clarity.

Unset items get `0.25` points — small enough to be clearly "not sized yet" without disappearing entirely. This is also a design decision: unset items are visible participants in the layout, not hidden.

---

## What this enables

**Single source of change.** The `300ms ease-in-out` tile transition currently appears once in the `SizingView.tsx` className and once (implicitly) in the style prop. If the design decision changes to `200ms`, it changes in one place in the token file and propagates everywhere.

**Design system documentation.** The tokens file *is* the documentation of design decisions. Reading it tells you more about the design intent than reading the component code, because the component code is optimized for execution, not explanation.

**Easier theming.** A second theme (dark mode, high-contrast mode, partner-branded version) is a second semantic token set that references different primitives. The component code doesn't change at all.

**Onboarding.** A new designer or engineer can read `semantic.tileLabel.name.fontSize = '12px'` and immediately understand the type hierarchy. They can look at `semantic.tile.unset.backgroundAlpha = 0.157` and understand why tiles in an unset state look different. The component's behavior is legible from the tokens.

---

## What I'd do next

The current token system covers the visualization component only. A complete design system for the treemapper app would also need:

- **UI chrome tokens** — the modal, the data input form, the navigation elements in the standalone app. These would use the same primitive layer but a different semantic layer (e.g., `semantic.modal.background`, `semantic.input.border.focus`).
- **Figma variables** — The tokens should be mirrored in Figma as Variables (the current Figma equivalent of design tokens). This creates a single source of truth that design and code both reference.
- **Style Dictionary integration** — For a multi-platform system, Style Dictionary can transform the TypeScript token object into CSS custom properties, JSON for Android/iOS, or Figma-compatible JSON from a single source. The structure here is already compatible.
