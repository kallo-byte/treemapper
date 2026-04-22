export interface ColorFamily {
  name: string;
  bars: [string, string, string, string, string];
  barNames: [string, string, string, string, string];
  background: string;
  backgroundWeekend: string;
}

export const COLOR_FAMILIES: ColorFamily[] = [
  {
    name: 'Teals & Aquas',
    bars: ['#2a4d52', '#2e7a7a', '#3d8a9e', '#4a9691', '#5a8075'],
    barNames: ['Petrol', 'Teal', 'Cyan', 'Turquoise', 'Seafoam'],
    background: '#e8f4f5',
    backgroundWeekend: '#d2e7e9',
  },
  {
    name: 'Golds & Yellows',
    bars: ['#6d4f1f', '#c49425', '#d47a2a', '#b38f4a', '#9d8037'],
    barNames: ['Bronze', 'Gold', 'Amber', 'Honey', 'Mustard'],
    background: '#fef9f0',
    backgroundWeekend: '#f0e7d2',
  },
  {
    name: 'Purples',
    bars: ['#4a2d52', '#7d4580', '#6b52a3', '#9e5f9e', '#8a6682'],
    barNames: ['Eggplant', 'Plum', 'Violet', 'Orchid', 'Mauve'],
    background: '#f5f0f7',
    backgroundWeekend: '#e4d9e8',
  },
  {
    name: 'Greens',
    bars: ['#2a4d2e', '#3d8a52', '#4a7865', '#6d7a3d', '#5a7358'],
    barNames: ['Forest', 'Emerald', 'Jade', 'Olive', 'Sage'],
    background: '#f0f7f1',
    backgroundWeekend: '#d9e8db',
  },
  {
    name: 'Blues',
    bars: ['#1f3654', '#2e5fa3', '#4575b8', '#4a5f87', '#5b7291'],
    barNames: ['Navy', 'Cobalt', 'Azure', 'Denim', 'Steel'],
    background: '#eff4f9',
    backgroundWeekend: '#d8e4ef',
  },
  {
    name: 'Oranges & Browns',
    bars: ['#5d3820', '#d4552a', '#b8654a', '#a3593d', '#8a5741'],
    barNames: ['Umber', 'Burnt Orange', 'Terracotta', 'Copper', 'Chestnut'],
    background: '#fef5f1',
    backgroundWeekend: '#f0e0d8',
  },
  {
    name: 'Greys & Neutrals',
    bars: ['#363d45', '#556270', '#6d7580', '#736b63', '#8a8579'],
    barNames: ['Charcoal', 'Slate', 'Pewter', 'Taupe', 'Stone'],
    background: '#f7f8f9',
    backgroundWeekend: '#e4e6e9',
  },
  {
    name: 'Reds & Pinks',
    bars: ['#7a2e3f', '#b34473', '#c4374a', '#d66359', '#a55670'],
    barNames: ['Burgundy', 'Magenta', 'Crimson', 'Coral', 'Rose'],
    background: '#fef2f4',
    backgroundWeekend: '#f0d9de',
  },
];

export const DEFAULT_FAMILY_INDEX = 0;
export const DEFAULT_SHADE_INDEX = 1;
