# Treemapper

A lightweight T-shirt sizing visualizer. Enter a two-level bullet list of swimlanes and sublanes, then assign XS/S/M/L/XL sizes to each sublane and see them laid out as a color-coded grid.

## Running the app

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

| Command | Description |
|---|---|
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Serve the production build locally |

## Usage

1. Click **Add Data** to open the data editor.
2. Enter your structure using plain text:
   - Plain lines → **swimlanes** (rows/regions)
   - Lines starting with `- ` → **sublanes** under the most recent swimlane
   - Empty lines are ignored
3. Click **Apply** — your swimlanes and sublanes appear as a sizing grid.
4. Click any sublane cell to assign a T-shirt size (XS → XL).
5. Use the color picker on each swimlane to change its color family; use the shade picker on sublanes to pick a lighter or darker variant.

### Example input

```
Platform
- Infrastructure
- Core Services

Product
- Mobile App
- Web App

Research
```

## Data persistence

All data (text, sizes, colors) is saved to `localStorage` under the `treemapper:` key prefix — no backend required.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 6](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com) (Dialog, DropdownMenu, AlertDialog)
- [Lucide React](https://lucide.dev) icons
