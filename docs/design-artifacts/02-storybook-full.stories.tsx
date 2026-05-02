/**
 * SizingView.stories.tsx
 *
 * Storybook 8 stories for treemapper-core/SizingView.
 * Run with: npx storybook dev
 *
 * Story structure:
 *   Default            – baseline: all lanes, no sizes assigned
 *   PreSized           – realistic session mid-point: most items sized
 *   SingleLane         – filtered to one swimlane (isolation mode)
 *   HighDensity        – stress test: 8 swimlanes × ~15 bars each
 *   MixedSizes         – asymmetric sizing shows treemap squarification
 *   AllXXL             – all items same size: should produce even grid
 *   EmptyBars          – edge case: no bars in a swimlane
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SizingView } from '../src/core/SizingView';
import type { Swimlane, TimelineBar, TShirtSize } from '../src/core/types';

// ─── Fixture helpers ────────────────────────────────────────────────────────

function makeSwimlane(id: string, name: string, colorHex: string): Swimlane {
  return { id, name, color: colorHex };
}

function makeBar(id: string, swimlaneId: string, name: string, colorHex: string): TimelineBar {
  return { id, swimlaneId, name, color: colorHex };
}

const SWIMLANES: Swimlane[] = [
  makeSwimlane('sl-cai',    'Character.AI',  '#2e7a7a'),
  makeSwimlane('sl-oai',    'OpenAI',        '#2e5fa3'),
  makeSwimlane('sl-roblox', 'Roblox',        '#7d4580'),
  makeSwimlane('sl-infra',  'Infrastructure','#556270'),
];

const BARS: TimelineBar[] = [
  // Character.AI
  makeBar('bar-cai-1', 'sl-cai', 'Spanish translations',      '#2e7a7a'),
  makeBar('bar-cai-2', 'sl-cai', 'Risk-tiered pathway UX',    '#3d8a9e'),
  makeBar('bar-cai-3', 'sl-cai', 'Italian translations',      '#4a9691'),
  makeBar('bar-cai-4', 'sl-cai', 'Detection guidance review', '#5a8075'),
  makeBar('bar-cai-5', 'sl-cai', 'Translation vendor QA',     '#2a4d52'),
  // OpenAI
  makeBar('bar-oai-1', 'sl-oai', 'ABC SSI in ChatGPT',        '#2e5fa3'),
  makeBar('bar-oai-2', 'sl-oai', 'User research interviews',  '#4575b8'),
  makeBar('bar-oai-3', 'sl-oai', 'Figma walkthroughs',        '#4a5f87'),
  // Roblox
  makeBar('bar-rbl-1', 'sl-roblox', 'SSI component design',   '#7d4580'),
  makeBar('bar-rbl-2', 'sl-roblox', 'Action plan copy',       '#6b52a3'),
  // Infrastructure
  makeBar('bar-inf-1', 'sl-infra', 'Roadmap app',             '#556270'),
  makeBar('bar-inf-2', 'sl-infra', 'Metabase dashboards',     '#6d7580'),
  makeBar('bar-inf-3', 'sl-infra', 'Data certification',      '#736b63'),
];

const DEFAULT_FAMILY_INDICES: Record<string, number> = {
  'sl-cai':    0,  // Teals
  'sl-oai':    4,  // Blues
  'sl-roblox': 2,  // Purples
  'sl-infra':  6,  // Greys
};

const DEFAULT_SHADE_INDICES: Record<string, number> = {};

// ─── Wrapper: adds local state for interactive stories ───────────────────────

function Controlled({
  initialSizes = {},
  swimlanes = SWIMLANES,
  bars = BARS,
  visibleSwimlaneIds,
  selectedSwimlaneId,
  selectedBarId,
}: {
  initialSizes?: Record<string, string>;
  swimlanes?: Swimlane[];
  bars?: TimelineBar[];
  visibleSwimlaneIds?: Set<string>;
  selectedSwimlaneId?: string;
  selectedBarId?: string;
}) {
  const [sizes, setSizes] = useState<Record<string, string>>(initialSizes);
  const [familyIndices, setFamilyIndices] = useState<Record<string, number>>(DEFAULT_FAMILY_INDICES);
  const [shadeIndices, setShadeIndices] = useState<Record<string, number>>(DEFAULT_SHADE_INDICES);

  const handleSizeChange = (barId: string, size: TShirtSize | null) => {
    setSizes(prev => {
      const next = { ...prev };
      if (size === null) delete next[barId];
      else next[barId] = size;
      return next;
    });
  };

  return (
    <div style={{ width: '900px', height: '500px', display: 'flex', flexDirection: 'column' }}>
      <SizingView
        swimlanes={swimlanes}
        bars={bars}
        sizes={sizes}
        onSizeChange={handleSizeChange}
        swimlaneFamilyIndices={familyIndices}
        sublaneShadeIndices={shadeIndices}
        onSwimlaneColorChange={(id, idx) => setFamilyIndices(prev => ({ ...prev, [id]: idx }))}
        onSublaneShadeChange={(id, idx) => setShadeIndices(prev => ({ ...prev, [id]: idx }))}
        visibleSwimlaneIds={visibleSwimlaneIds}
        selectedSwimlaneId={selectedSwimlaneId}
        selectedBarId={selectedBarId}
      />
    </div>
  );
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof SizingView> = {
  title: 'treemapper-core/SizingView',
  component: SizingView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**SizingView** renders a squarified treemap for T-shirt sizing work items.

Each item is a tile whose canvas area is proportional to its assigned size.
Swimlanes (project areas) are the top-level regions; sublanes (individual work items)
nest inside them. The layout recomputes in real-time as sizes change.

**Size scale:** \`XXS=0.5, XS=1, S=2, M=4, L=8, XL=16, XXL=32\` points.
A doubling scale — XL is visually twice the area of L.

**Interaction:** Click any tile to cycle through sizes. Use the \`⋯\` menu to set
a specific size, change sublane shade, or open the detail panel.
        `,
      },
    },
  },
  argTypes: {
    swimlanes: {
      description: 'Top-level groupings. Each swimlane gets a color family and contains a set of bars.',
      control: false,
    },
    bars: {
      description: 'Individual work items. Each bar belongs to one swimlane via `swimlaneId`.',
      control: false,
    },
    sizes: {
      description: 'Map of `barId → TShirtSize`. Drives tile area. Unset bars render at 0.25pts (visible but clearly unsized).',
      control: false,
    },
    swimlaneFamilyIndices: {
      description: 'Map of `swimlaneId → index` into `COLOR_FAMILIES` (0–7). Controls the hue family for the swimlane region.',
      control: false,
    },
    sublaneShadeIndices: {
      description: 'Map of `barId → index` into the swimlane\'s color family shades (0–4). Defaults to shade index 1.',
      control: false,
    },
    visibleSwimlaneIds: {
      description: 'If provided, only these swimlanes are rendered. The visible region is re-centered in the available canvas.',
      control: false,
    },
    selectedSwimlaneId: {
      description: 'Renders a double white ring on the matching swimlane region.',
      control: { type: 'text' },
    },
    selectedBarId: {
      description: 'Renders a double white inset ring on the matching tile.',
      control: { type: 'text' },
    },
    onSizeChange: {
      description: 'Called when the user clicks a tile or picks a size from the menu. Receives `(barId, size | null)`.',
      action: 'onSizeChange',
    },
    onSwimlaneColorChange: {
      description: 'Called when the user picks a color family for a swimlane. Receives `(swimlaneId, familyIndex)`.',
      action: 'onSwimlaneColorChange',
    },
    onSublaneShadeChange: {
      description: 'Called when the user picks a shade for an individual bar. Receives `(barId, shadeIndex)`.',
      action: 'onSublaneShadeChange',
    },
    onOpenPanel: {
      description: 'Optional. If provided, "See details" appears in the tile menu. Receives `{ type: \'swimlane\' | \'sublane\', id: string }`.',
      action: 'onOpenPanel',
    },
    nameOverrides: {
      description: 'Optional display name overrides for sublanes: `{ sublanes: Record<barId, string> }`. Does not change the underlying `bar.name`.',
      control: false,
    },
    onResetSizes: {
      description: 'Accepted for API compatibility. The component itself does not render a reset button — this is the consumer\'s responsibility.',
      action: 'onResetSizes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SizingView>;

// ─── Stories ─────────────────────────────────────────────────────────────────

/** Blank canvas — no sizes assigned. All tiles show "Click to size" with ghost opacity. */
export const Default: Story = {
  name: 'Default (no sizes)',
  render: () => <Controlled />,
};

/**
 * Mid-session state — most items have sizes.
 * Shows the treemap's primary value: you can see at a glance that
 * "Risk-tiered pathway UX" is the biggest item in the C.AI lane.
 */
export const PreSized: Story = {
  name: 'Mid-session (most items sized)',
  render: () => (
    <Controlled
      initialSizes={{
        'bar-cai-1': 'M',
        'bar-cai-2': 'XL',
        'bar-cai-3': 'M',
        'bar-cai-4': 'S',
        'bar-cai-5': 'S',
        'bar-oai-1': 'L',
        'bar-oai-2': 'M',
        'bar-oai-3': 'XS',
        'bar-rbl-1': 'L',
        // bar-rbl-2: intentionally unset — shows ghost tile in a mostly-sized lane
        'bar-inf-1': 'XXL',
        'bar-inf-2': 'L',
        'bar-inf-3': 'M',
      }}
    />
  ),
};

/**
 * Single swimlane isolation — only the C.AI lane is visible.
 * The component re-centers the visible region in the available canvas.
 * Use this to focus a sizing session on one project area at a time.
 */
export const SingleLane: Story = {
  name: 'Single lane (filtered)',
  render: () => (
    <Controlled
      visibleSwimlaneIds={new Set(['sl-cai'])}
      initialSizes={{
        'bar-cai-1': 'M',
        'bar-cai-2': 'XL',
        'bar-cai-3': 'M',
        'bar-cai-4': 'S',
        'bar-cai-5': 'S',
      }}
    />
  ),
};

/**
 * Asymmetric sizing — demonstrates squarification.
 * One XXL item dominates the layout; smaller items cluster visibly.
 * Shows why the doubling scale is the right choice: you can intuit
 * relative scale at a glance.
 */
export const MixedSizes: Story = {
  name: 'Asymmetric sizing (squarification demo)',
  render: () => (
    <Controlled
      initialSizes={{
        'bar-cai-1': 'S',
        'bar-cai-2': 'XXL',
        'bar-cai-3': 'XS',
        'bar-cai-4': 'XXS',
        'bar-cai-5': 'S',
        'bar-oai-1': 'XL',
        'bar-oai-2': 'M',
        'bar-oai-3': 'S',
        'bar-rbl-1': 'M',
        'bar-rbl-2': 'S',
        'bar-inf-1': 'XXL',
        'bar-inf-2': 'L',
        'bar-inf-3': 'XS',
      }}
    />
  ),
};

/**
 * All items at the same size — should produce an approximately even grid
 * within each swimlane, with swimlane proportions matching bar counts.
 * Useful for verifying that the layout algorithm handles uniform inputs.
 */
export const AllMedium: Story = {
  name: 'Uniform sizing (all M)',
  render: () => (
    <Controlled
      initialSizes={Object.fromEntries(BARS.map(b => [b.id, 'M']))}
    />
  ),
};

/**
 * High density — stress test with many items.
 * Tests label threshold behavior: small tiles should collapse to
 * size-badge-only or no-label rather than overflowing text.
 */
export const HighDensity: Story = {
  name: 'High density (stress test)',
  render: () => {
    const manyBars: TimelineBar[] = Array.from({ length: 40 }, (_, i) => {
      const slIdx = i % SWIMLANES.length;
      const sl = SWIMLANES[slIdx];
      return makeBar(`stress-${i}`, sl.id, `Item ${i + 1}`, sl.color);
    });
    const manyInitialSizes = Object.fromEntries(
      manyBars.map((b, i) => {
        const sizes = ['S', 'M', 'L', 'XS', 'XL', 'M', 'S', 'XXS'];
        return [b.id, sizes[i % sizes.length]];
      })
    );
    return <Controlled bars={manyBars} initialSizes={manyInitialSizes} />;
  },
};

/**
 * Selection states — shows both selectedSwimlaneId and selectedBarId highlighting.
 * The swimlane ring doubles, the tile gets an inset white glow.
 */
export const SelectionStates: Story = {
  name: 'Selection states',
  render: () => (
    <Controlled
      selectedSwimlaneId="sl-cai"
      selectedBarId="bar-cai-2"
      initialSizes={{
        'bar-cai-1': 'M',
        'bar-cai-2': 'XL',
        'bar-cai-3': 'M',
        'bar-cai-4': 'S',
        'bar-cai-5': 'S',
        'bar-oai-1': 'L',
        'bar-oai-2': 'M',
        'bar-oai-3': 'XS',
        'bar-rbl-1': 'L',
        'bar-rbl-2': 'M',
        'bar-inf-1': 'XXL',
        'bar-inf-2': 'L',
        'bar-inf-3': 'M',
      }}
    />
  ),
};
