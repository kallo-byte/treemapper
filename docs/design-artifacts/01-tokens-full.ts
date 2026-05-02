/**
 * treemapper-core design tokens
 *
 * Three-tier structure:
 *   primitive → semantic → (consumed directly in component styles)
 *
 * Primitives name raw values. Semantics assign meaning.
 * Components reference semantics, never primitives directly.
 *
 * Naming convention:
 *   [layer].[category].[variant].[modifier]
 *   e.g. semantic.tile.unset.backgroundAlpha
 */

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE TOKENS
// ─────────────────────────────────────────────────────────────────────────────

export const primitive = {
  color: {
    // Neutral scale
    white: '#ffffff',
    gray: {
      50:  '#f7f8f9',
      100: '#f0f1f3',
      200: '#e4e6e9',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      900: '#111827',
    },
    black: '#000000',

    // Color families — matches COLOR_FAMILIES in color-families.ts
    // Each family has 5 ordered shades (deep → muted) and 2 bg tints
    teal: {
      shade: { deep: '#2a4d52', default: '#2e7a7a', mid: '#3d8a9e', soft: '#4a9691', muted: '#5a8075' },
      bg: { default: '#e8f4f5', secondary: '#d2e7e9' },
    },
    gold: {
      shade: { deep: '#6d4f1f', default: '#c49425', mid: '#d47a2a', soft: '#b38f4a', muted: '#9d8037' },
      bg: { default: '#fef9f0', secondary: '#f0e7d2' },
    },
    purple: {
      shade: { deep: '#4a2d52', default: '#7d4580', mid: '#6b52a3', soft: '#9e5f9e', muted: '#8a6682' },
      bg: { default: '#f5f0f7', secondary: '#e4d9e8' },
    },
    green: {
      shade: { deep: '#2a4d2e', default: '#3d8a52', mid: '#4a7865', soft: '#6d7a3d', muted: '#5a7358' },
      bg: { default: '#f0f7f1', secondary: '#d9e8db' },
    },
    blue: {
      shade: { deep: '#1f3654', default: '#2e5fa3', mid: '#4575b8', soft: '#4a5f87', muted: '#5b7291' },
      bg: { default: '#eff4f9', secondary: '#d8e4ef' },
    },
    orange: {
      shade: { deep: '#5d3820', default: '#d4552a', mid: '#b8654a', soft: '#a3593d', muted: '#8a5741' },
      bg: { default: '#fef5f1', secondary: '#f0e0d8' },
    },
    neutral: {
      shade: { deep: '#363d45', default: '#556270', mid: '#6d7580', soft: '#736b63', muted: '#8a8579' },
      bg: { default: '#f7f8f9', secondary: '#e4e6e9' },
    },
    red: {
      shade: { deep: '#7a2e3f', default: '#b34473', mid: '#c4374a', soft: '#d66359', muted: '#a55670' },
      bg: { default: '#fef2f4', secondary: '#f0d9de' },
    },
  },

  // Spacing — 4px base unit
  space: {
    0:  '0px',
    1:  '4px',
    1.5: '6px',
    2:  '8px',
    3:  '12px',
    4:  '16px',
    6:  '24px',
    8:  '32px',
  },

  // Typography
  font: {
    size: {
      '2xs': '9px',
      xs:   '11px',
      sm:   '12px',
      base: '14px',
    },
    weight: {
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    leading: {
      tight: 1.2,
      snug:  1.35,
    },
  },

  // Border radius
  radius: {
    none: '0px',
    sm:   '2px',
    md:   '4px',
    lg:   '6px',
  },

  // Motion
  duration: {
    fast:   '150ms',
    normal: '300ms',
    slow:   '500ms',
  },
  easing: {
    inOut: 'ease-in-out',
    out:   'ease-out',
  },

  // Opacity
  opacity: {
    tile: {
      unsetBg:    0.157,  // hex: 28/255 — unset tile background tint
      tileBorder: 0.25,   // rgba white border between tiles
      label:      0.90,   // primary label text on colored tile
      labelDim:   0.50,   // secondary label text (size badge when unset)
      labelBold:  0.80,   // size badge text when sized
      menuBg:     0.20,   // dot-menu button background at rest
      menuBgHover:0.40,   // dot-menu button background on hover
    },
    swimlane: {
      ringOpacity: 0.35,  // second inner ring on selected swimlane
    },
    chrome: {
      invisible: 0,
      visible:   1,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC TOKENS
// ─────────────────────────────────────────────────────────────────────────────

export const semantic = {
  // Canvas — the overall visualization surface
  canvas: {
    background:     primitive.color.gray[50],   // bg-gray-50
    padding:        primitive.space[3],
  },

  // Tile — individual work item cells
  tile: {
    border: `1px solid rgba(255,255,255,${primitive.opacity.tile.tileBorder})`,
    unset: {
      backgroundAlpha: primitive.opacity.tile.unsetBg,
      // Used as: `${cellColor}28` (hex alpha) when tile has no size assigned
    },
    selected: {
      // double ring: sharp white inside, soft white outside
      boxShadow: 'inset 0 0 0 2px white, inset 0 0 0 4px rgba(255,255,255,0.4)',
    },
    transition: {
      properties: 'left, top, width, height',
      duration:   primitive.duration.normal,
      easing:     primitive.easing.inOut,
    },
    label: {
      // Thresholds below which the label collapses to size-only or hidden
      fullLabelMinWidth:  72,
      fullLabelMinHeight: 44,
      sizeOnlyMinDim:     18,
      menuMinDim:         28,
      // Padding: max(4px, 4% of tile dimension)
      padPercent: 0.04,
      padMin:     parseInt(primitive.space[1]),
    },
  },

  // Tile label typography
  tileLabel: {
    name: {
      fontSize:   primitive.font.size.sm,         // 12px
      fontWeight: primitive.font.weight.medium,
      color:      `rgba(255,255,255,${primitive.opacity.tile.label})`,
      leading:    primitive.font.leading.tight,
    },
    sizeBadge: {
      sized: {
        fontSize:   primitive.font.size['2xs'],   // 9px
        fontWeight: primitive.font.weight.bold,
        color:      `rgba(255,255,255,${primitive.opacity.tile.labelBold})`,
      },
      unset: {
        fontSize:   primitive.font.size['2xs'],
        fontWeight: primitive.font.weight.medium,
        color:      `rgba(255,255,255,${primitive.opacity.tile.labelDim})`,
        // Label: "Click to size"
      },
    },
  },

  // Swimlane — the grouped region containing related tiles
  swimlane: {
    ring: {
      base:     `inset 0 0 0 3px white`,
      selected: `inset 0 0 0 3px white, inset 0 0 0 6px rgba(255,255,255,${primitive.opacity.swimlane.ringOpacity})`,
    },
    label: {
      fontSize:     primitive.font.size.sm,
      fontWeight:   primitive.font.weight.bold,
      color:        primitive.color.white,
      borderRadius: primitive.radius.sm,
      offsetX:      primitive.space[1.5],         // 6px from left edge of region
      offsetY:      primitive.space[1.5],
    },
    menu: {
      button: {
        size:       primitive.space[6],            // 24px × 24px
        borderRadius: primitive.radius.md,
        bgRest:     `rgba(0,0,0,${primitive.opacity.tile.menuBg})`,
        bgHover:    `rgba(0,0,0,${primitive.opacity.tile.menuBgHover})`,
        color:      primitive.color.white,
      },
    },
  },

  // Chrome — footer and UI framing
  chrome: {
    hint: {
      fontSize:   primitive.font.size.xs,         // 11px
      color:      primitive.color.gray[400],
      padding:    `${primitive.space[1.5]} ${primitive.space[3]}`,
      borderTop:  `1px solid ${primitive.color.gray[100]}`,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SIZE SCALE TOKENS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * T-shirt size point values drive the squarified treemap layout.
 * The doubling scale (0.5 → 1 → 2 → 4 → 8 → 16 → 32) means an XL item
 * gets exactly twice the canvas area of an L item. This is a design decision,
 * not just a data mapping — it makes relative size visually intuitive.
 */
export const sizeScale = {
  XXS: 0.5,
  XS:  1,
  S:   2,
  M:   4,
  L:   8,
  XL:  16,
  XXL: 32,
  // Unset items render at a fractional point value so they occupy visible
  // space in the layout without implying a real size estimate.
  UNSET: 0.25,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// USAGE
// ─────────────────────────────────────────────────────────────────────────────
//
// In component code, reference semantic tokens rather than primitives:
//
//   style={{
//     backgroundColor: isUnset ? `${cellColor}28` : cellColor,
//     // ↑ 28 = hex for semantic.tile.unset.backgroundAlpha (0.157 * 255 ≈ 40)
//     border: semantic.tile.border,
//     boxShadow: isSelected ? semantic.tile.selected.boxShadow : undefined,
//     transition: `${semantic.tile.transition.properties} ${semantic.tile.transition.duration} ${semantic.tile.transition.easing}`,
//   }}
//
// Avoid:
//   style={{ fontSize: '12px', fontWeight: '500' }}  // ❌ magic numbers
// Prefer:
//   style={{ fontSize: semantic.tileLabel.name.fontSize, fontWeight: semantic.tileLabel.name.fontWeight }}  // ✅
