# Journey Map — A Team Sizing Session with treemapper
### Portfolio Deep-Dive

---

## What this artifact is and why it exists

A journey map documents the end-to-end experience of a user (or users) moving through a tool or process over time. It captures not just what they do, but what they're thinking, what they feel at each step, and where friction or opportunity lives.

This artifact is deliberately independent of the implementation. I'm not describing how the code works — I'm describing what it's like to be a team using this tool in a real planning session. The two documents aren't the same thing, and they shouldn't be. A journey map written from the code's perspective is just a user flow with more words.

For portfolio purposes, this map serves two goals:

1. It shows that I can think about the user experience of a tool I built — critically and honestly, including where it falls short.
2. It demonstrates that design thinking happened before, during, and after the build, not only during.

---

## The scenario

**Team:** A 5-person product team at a mid-size startup. The product lead (PL) runs the sizing session. Two engineers and two designers participate.

**Context:** Quarterly planning. The team has ~35 work items in their tracker across 4 project areas. They've never used a treemap for sizing before — they usually do this in a spreadsheet.

**Goal of the session:** Assign rough T-shirt sizes to all 35 items so the PL can produce a capacity estimate by end of week.

**Duration:** ~60 minutes (the session, not the tool usage — the tool is part of a broader meeting).

---

## Journey phases

### Phase 1 — Before the session (PL only)
*"Is this tool going to work for our meeting?"*

**What happens:**
The PL opens the treemapper standalone app to set it up before the session. They paste in their work items (formatted as bullet points), see the items appear as tiles, and try a few clicks to understand the interaction.

**What they think:**
> "Okay, clicking a tile cycles the size — that's simple enough. But how do I explain this to my team? The whole thing is blank right now, which feels a bit stark."

**What they feel:**
Cautiously optimistic. The visual promise of the tool is clear — they can already imagine what it'll look like when everything is sized. But there's mild anxiety about introducing a new tool to a team that has its own established habits.

**Pain points:**
- The blank-canvas starting state offers no affordance for "what this will become." There's no skeleton or placeholder that shows the shape of the finished visualization.
- The PL has to explain the interaction model verbally before the session starts. There's no in-product tutorial or first-use guide.

**Design decision made here:**
The "Click to size" label on unset tiles addresses part of this — the tool narrates the interaction from inside the tile itself. But it only works if the tiles are large enough to show the full label (≥72×44px), which they won't be at high item counts.

**Opportunity:**
An onboarding tooltip sequence (show once, dismissable) would reduce verbal setup time. Something as simple as: *"Click any tile to assign a size. Click again to change it."*

---

### Phase 2 — Orientation (full team)
*"What are we looking at?"*

**What happens:**
The PL shares their screen. The team sees the treemapper for the first time. The tiles are all ghost-opacity (unset). The swimlane labels are visible but small. The team asks what they're looking at.

**What they think:**
> "Is each box one task? Why are they different sizes?"
(They're not different sizes — they all start at 0.25pts each. But the squarified algorithm produces non-uniform rectangles even at uniform input, which is confusing before any sizing has happened.)

**What they feel:**
Slightly confused. The unfamiliarity of the treemap form factor is a real friction point. Teams that think about work as lists find the spatial layout disorienting at first.

**Pain points:**
- The default state (all tiles at 0.25pts) produces irregular tile sizes that look like they mean something. They don't — they're layout artifacts.
- The swimlane-level color coding is the clearest visual signal, but swimlane labels are small and positioned at the top-left of each region, which is easy to miss when all eyes are scanning for orientation cues.

**Design decision made here:**
The swimlane label uses the swimlane's own color as its background chip, making it visually connected to the tiles. This is the primary orientation tool and it works — but only after 10–15 seconds of scanning.

**Opportunity:**
An "all equal" default mode (where all unset tiles render at the same size, not squarified) might reduce the confusion of the initial state. The treemap form factor starts being valuable once sizing begins; before that, equal-area tiles are less misleading.

---

### Phase 3 — First sizing (first 10 minutes)
*"Let's try this."*

**What happens:**
The PL starts clicking tiles. The team watches. After the first few clicks, sizes appear and tiles start shifting in real-time. The team visibly reacts — this is the moment the tool reveals its value.

**What they think:**
> "Oh — it moves when you size things. The big ones get bigger."
> "Can I make that one smaller? It feels too big."

**What they feel:**
The "aha" moment happens in this phase for most teams. The real-time layout recomputation is the tool's most powerful moment. Seeing a tile physically expand when you mark it XL — and all neighboring tiles compress to accommodate it — makes relative scale tangible in a way a spreadsheet can't.

**Pain points:**
- Early in the session, most tiles are still unset, and the layout shifts dramatically with each new size assigned. The constant visual movement can feel disorienting until most items have been sized and the layout stabilizes.
- The `300ms ease-in-out` tile animation helps — it softens the movement. But for the first few items, the transitions feel like the tool is "figuring itself out," not like the team is building toward a stable picture.

**Design decision made here:**
The 300ms transition duration was chosen after testing shorter (150ms felt too abrupt) and longer (500ms felt sluggish during active clicking). It's a direct design decision with a reason.

**Opportunity:**
A "rough draft" mode where tiles don't animate during rapid changes (only settling when there's a 200ms pause in interaction) might reduce visual noise in the first few minutes.

---

### Phase 4 — Active sizing (middle 30 minutes)
*"This is actually working."*

**What happens:**
The team settles into a rhythm. They discuss each item briefly, click to assign a size, and move on. The PL occasionally filters to a single swimlane to focus the discussion. Items that generate debate get labeled with a provisional size and noted for follow-up.

**What they think:**
> "I want to check: everything in the blue lane — what's the total there?"
(The team wants numbers, not just shapes.)

> "Can I see just the items we haven't sized yet?"
(The ghost tiles are visible, but scanning for them in a full session is harder than expected.)

**What they feel:**
Productive. The spatial layout is now helping rather than confusing. Team members start using the treemap to make comparative arguments: "That feels bigger than this — they should probably be the same size."

**Pain points:**
- No total points display. The treemap communicates proportions intuitively, but teams also want a number. "We have ~80 points of sized work this quarter" is something the tool could compute but doesn't show.
- No "show only unset" filter. Finding the remaining ghost tiles requires scanning the full layout, which gets harder as the session progresses and most tiles are colored.
- The menu (⋯) discovery is low. Some team members spend several minutes cycling through sizes before realizing the menu exists.

**Design decision made here:**
The swimlane-level "Reset lane sizes" menu item lets the PL set all items in a lane to the same size as a starting point, then adjust individually. This is a common pattern in sizing sessions ("let's start everything at M and see what needs to move") and it was built into the swimlane menu.

**Opportunity:**
A status bar showing `{n} sized / {total} items` and `{total points}` would address the "how are we doing?" question without requiring external tracking.

---

### Phase 5 — Review and export (last 10 minutes)
*"Okay, what did we decide?"*

**What happens:**
Most items are now sized. The PL wants to share the result with someone who wasn't in the session, and save it for the quarterly planning doc.

**What they think:**
> "How do I save this? Do I take a screenshot?"
> "Can I export this as a PDF or something I can paste into a doc?"

**What they feel:**
Mild frustration. The sizing session produced a clear, useful picture — but getting it out of the tool in a shareable form is a manual step.

**Pain points:**
- No native export. The PNG export feature is built and tested in koko-planner but currently hidden (pending the Slack API `files:write` scope upgrade for direct-to-channel posting). The standalone app has no export at all.
- No session summary. After sizing, the team has no artifact besides the visual. A text summary ("Character.AI: 32pts total. Largest items: Risk-tiered pathway UX (XL=16pts), Spanish translations (M=4pts)...") would be useful for async communication.

**Design decision made here:**
The export feature was implemented with `html2canvas`. The inline style approach for colors (rather than Tailwind utilities) was chosen specifically because html2canvas cannot parse oklch color values, which Tailwind v4 uses by default. This was a pragmatic constraint-driven design decision.

**Opportunity:**
The export is the clearest missing feature in this journey. The work is done — it just needs the API scope to be unblocked, and a UI affordance in the component itself (an export button in the toolbar area).

---

## Summary of design decisions traced to user needs

| User need observed | Design decision made | Where in code |
|---|---|---|
| "What do I do with a blank tile?" | "Click to size" hint text on unset tiles | `TileCell.tsx: isUnset` label |
| "Why is everything moving?" | 300ms ease-in-out transition | `TileCell` className |
| "I want to set all of these to the same size" | "Reset lane sizes" swimlane menu | Swimlane ⋯ menu |
| "I want to focus on one project area" | `visibleSwimlaneIds` filter + re-centering | `SizingView: visibleGroups` logic |
| "That item is bigger than this one should be" | Doubling size scale (area = 2× per step) | `SIZE_POINTS` in `types.ts` |
| "I need this tile to stand out" | Per-bar shade selection (5 shades per family) | `onSublaneShadeChange` |

---

## What this map reveals about what to build next

Three of the five journey phases contain a pain point directly addressable by a specific feature:

1. **Phase 2 (orientation):** An onboarding tooltip or a "start here" overlay for first-time users.
2. **Phase 4 (active sizing):** A status bar with item counts and total points.
3. **Phase 5 (export):** Unblock and surface the PNG export. Add a text summary output.

None of these require architectural changes to the component. They're incremental additions that address the clearest friction points in the actual user journey.
