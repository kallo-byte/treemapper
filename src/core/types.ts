export type TShirtSize = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export const SIZE_SEQUENCE: (TShirtSize | null)[] = [null, 'S', 'M', 'L', 'XL', 'XXL', 'XS', 'XXS'];

export const SIZE_POINTS: Record<TShirtSize, number> = { XXS: 0.5, XS: 1, S: 2, M: 4, L: 8, XL: 16, XXL: 32 };

export interface MetaField {
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: (newValue: string) => void;
}

export interface MetaSection {
  title: string;
  fields: MetaField[];
}

export interface EntityMetadata {
  description?: string;
  fields?: MetaField[];
  sections?: MetaSection[];
}

export interface Swimlane {
  id: string;
  name: string;
  color: string;
  metadata?: EntityMetadata;
}

export interface TimelineBar {
  id: string;
  swimlaneId: string;
  name: string;
  color: string;
  metadata?: EntityMetadata;
}
