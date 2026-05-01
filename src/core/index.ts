/*
 * Consumer setup (do both in your app):
 *
 * 1. Import styles — skip if you already define the same CSS variables:
 *      import 'treemapper-core/styles.css'
 *
 * 2. Tell Tailwind to scan treemapper-core source so utility classes aren't purged.
 *    Tailwind v4 — add to your globals.css:
 *      @source "../node_modules/treemapper-core/src/core";
 *    Tailwind v3 — add to tailwind.config.js content array:
 *      "./node_modules/treemapper-core/src/core/**\/*.{ts,tsx}"
 */
export { SizingView } from './SizingView';
export { SwimlaneFilter } from './SwimlaneFilter';
export type {
  Swimlane,
  TimelineBar,
  TShirtSize,
  EntityMetadata,
  MetaField,
  MetaSection,
} from './types';
export { SIZE_POINTS, SIZE_SEQUENCE } from './types';
export { COLOR_FAMILIES, DEFAULT_FAMILY_INDEX, DEFAULT_SHADE_INDEX } from './color-families';
export type { ColorFamily } from './color-families';
