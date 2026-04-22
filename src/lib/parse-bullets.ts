export interface ParsedSwimlane {
  id: string;
  name: string;
}

export interface ParsedSublane {
  id: string;
  swimlaneId: string;
  name: string;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

export function parseBullets(text: string): { swimlanes: ParsedSwimlane[]; sublanes: ParsedSublane[] } {
  const lines = text.split('\n');
  const swimlanes: ParsedSwimlane[] = [];
  const sublanes: ParsedSublane[] = [];
  let currentSwimlaneId: string | null = null;
  const seenSwimlaneIds = new Set<string>();
  const seenSublaneIds = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('- ')) {
      const name = trimmed.slice(2).trim();
      if (!name || !currentSwimlaneId) continue;
      let id = `bar-${currentSwimlaneId}||${slugify(name)}`;
      let counter = 1;
      const baseId = id;
      while (seenSublaneIds.has(id)) id = `${baseId}-${counter++}`;
      seenSublaneIds.add(id);
      sublanes.push({ id, swimlaneId: currentSwimlaneId, name });
    } else {
      const name = trimmed;
      let id = `sl-${slugify(name)}`;
      let counter = 1;
      const baseId = id;
      while (seenSwimlaneIds.has(id)) id = `${baseId}-${counter++}`;
      seenSwimlaneIds.add(id);
      swimlanes.push({ id, name });
      currentSwimlaneId = id;
    }
  }

  return { swimlanes, sublanes };
}
