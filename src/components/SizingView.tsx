import { useEffect, useRef, useState, useCallback } from 'react';
import { MoreHorizontal, RotateCcw } from 'lucide-react';
import { COLOR_FAMILIES, DEFAULT_SHADE_INDEX } from '@/lib/color-families';
import { Swimlane, TimelineBar } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type TShirtSize = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

// Cycle order: unset → S → M → L → XL → XXL → XS → XXS → unset
const SIZE_SEQUENCE: (TShirtSize | null)[] = [null, 'S', 'M', 'L', 'XL', 'XXL', 'XS', 'XXS'];

const SIZE_POINTS: Record<TShirtSize, number> = { XXS: 0.5, XS: 1, S: 2, M: 4, L: 8, XL: 16, XXL: 32 };

const UNSET_PTS = 0.25;

function cycleSize(current: string | undefined): TShirtSize | null {
  const idx = SIZE_SEQUENCE.indexOf((current as TShirtSize) ?? null);
  return SIZE_SEQUENCE[(idx + 1) % SIZE_SEQUENCE.length] ?? null;
}

function sizePoints(size: string | undefined): number {
  return size ? (SIZE_POINTS[size as TShirtSize] ?? 1) : UNSET_PTS;
}

// ── Squarified treemap ───────────────────────────────────────────────────────

interface Rect { x: number; y: number; w: number; h: number }
interface LayoutTile extends Rect { id: string }

function worstRatio(areas: number[], sideLen: number): number {
  if (areas.length === 0 || sideLen <= 0) return Infinity;
  const s = areas.reduce((a, b) => a + b, 0);
  const rMax = Math.max(...areas);
  const rMin = Math.min(...areas);
  const s2 = s * s;
  const l2 = sideLen * sideLen;
  return Math.max((l2 * rMax) / s2, s2 / (l2 * rMin));
}

function squarify(
  items: { id: string; pts: number }[],
  rect: Rect,
  total: number,
  out: LayoutTile[],
): void {
  if (items.length === 0) return;
  const { x, y, w, h } = rect;

  if (items.length === 1) {
    out.push({ id: items[0].id, x, y, w, h });
    return;
  }

  const isWide = w >= h;
  const shortSide = isWide ? h : w;
  const scale = (w * h) / total;

  let row: { id: string; pts: number }[] = [];
  let rowAreas: number[] = [];
  let i = 0;

  while (i < items.length) {
    const newAreas = [...rowAreas, items[i].pts * scale];
    if (row.length === 0 || worstRatio(newAreas, shortSide) <= worstRatio(rowAreas, shortSide)) {
      row.push(items[i]);
      rowAreas = newAreas;
      i++;
    } else {
      break;
    }
  }

  const rowPts = row.reduce((s, r) => s + r.pts, 0);
  const rowThickness = (rowPts / total) * (isWide ? w : h);
  let offset = 0;

  for (let j = 0; j < row.length; j++) {
    const len = rowAreas[j] / rowThickness;
    out.push(
      isWide
        ? { id: row[j].id, x, y: y + offset, w: rowThickness, h: len }
        : { id: row[j].id, x: x + offset, y, w: len, h: rowThickness },
    );
    offset += len;
  }

  const remaining = items.slice(row.length);
  if (remaining.length > 0) {
    const remainPts = total - rowPts;
    squarify(
      remaining,
      isWide
        ? { x: x + rowThickness, y, w: w - rowThickness, h }
        : { x, y: y + rowThickness, w, h: h - rowThickness },
      remainPts,
      out,
    );
  }
}

function computeLayout(items: { id: string; pts: number }[], rect: Rect): LayoutTile[] {
  const total = items.reduce((s, i) => s + i.pts, 0);
  if (total <= 0 || rect.w <= 0 || rect.h <= 0) return [];
  const out: LayoutTile[] = [];
  squarify(items, rect, total, out);
  return out;
}

// ── Tile Component ──────────────────────────────────────────────────────────

interface TileProps {
  tile: LayoutTile;
  bar: TimelineBar;
  size: TShirtSize | undefined;
  sizes: Record<string, string>;
  cellColor: string;
  family: (typeof COLOR_FAMILIES)[0];
  showFullLabel: boolean;
  showSizeOnly: boolean;
  showMenu: boolean;
  sublaneShadeIndices: Record<string, number>;
  onSizeChange: (barId: string, size: TShirtSize | null) => void;
  onSublaneShadeChange: (sublaneId: string, shadeIndex: number) => void;
}

function TileCell({
  tile,
  bar,
  size,
  cellColor,
  family,
  showFullLabel,
  showSizeOnly,
  showMenu,
  sublaneShadeIndices,
  onSizeChange,
  onSublaneShadeChange,
}: TileProps) {
  const isUnset = !size;
  const shadeIdx = sublaneShadeIndices[bar.id] ?? DEFAULT_SHADE_INDEX;
  const labelRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (isUnset && labelRef.current) {
      labelRef.current.style.backgroundColor = cellColor;
    }
  }, [isUnset, cellColor]);

  const handleMouseLeave = useCallback(() => {
    if (labelRef.current) {
      labelRef.current.style.backgroundColor = 'transparent';
    }
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSizeChange(bar.id, cycleSize(size))}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onSizeChange(bar.id, cycleSize(size));
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${bar.name} · ${size ?? 'unset'} — click to change`}
      className="group absolute hover:brightness-90 active:brightness-75 transition-[left,top,width,height] duration-300 ease-in-out focus:outline-none cursor-pointer"
      style={{
        left: tile.x,
        top: tile.y,
        width: tile.w,
        height: tile.h,
        backgroundColor: isUnset ? `${cellColor}28` : cellColor,
        border: `1px solid rgba(255,255,255,0.25)`,
      }}
    >
      {showFullLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-1 overflow-hidden pointer-events-none">
          <span
            ref={labelRef}
            className="text-[10px] leading-tight text-white/90 font-medium text-center line-clamp-2 w-full rounded-sm px-1 py-0.5 transition-colors duration-200"
          >
            {bar.name}
          </span>
          <span
            className={`text-sm font-bold leading-none ${isUnset ? 'text-white/30' : 'text-white'}`}
          >
            {size ?? '?'}
          </span>
        </div>
      )}
      {showSizeOnly && !showFullLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-xs font-bold ${isUnset ? 'text-white/30' : 'text-white'}`}>
            {size ?? '?'}
          </span>
        </div>
      )}

      {/* Sublane ··· menu */}
      {showMenu && (
        <div className="absolute top-1 right-1 z-20" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-5 h-5 rounded opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100 bg-black/20 hover:bg-black/40 text-white transition-opacity">
                <MoreHorizontal className="size-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Size</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {SIZE_SEQUENCE.filter((s): s is TShirtSize => s !== null).map(s => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => onSizeChange(bar.id, s)}
                      className={size === s ? 'font-semibold' : ''}
                    >
                      {s}
                      {size === s ? ' ✓' : ''}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSizeChange(bar.id, null)}>
                    Unset{!size ? ' ✓' : ''}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Shade</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {family.bars.map((hex, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => onSublaneShadeChange(bar.id, idx)}
                      className={shadeIdx === idx ? 'font-semibold' : ''}
                    >
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      {family.barNames[idx]}
                      {shadeIdx === idx ? ' ✓' : ''}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface SizingViewProps {
  swimlanes: Swimlane[];
  bars: TimelineBar[];
  sizes: Record<string, string>;
  onSizeChange: (barId: string, size: TShirtSize | null) => void;
  onResetSizes: () => void;
  swimlaneFamilyIndices: Record<string, number>;
  sublaneShadeIndices: Record<string, number>;
  onSwimlaneColorChange: (swimlaneId: string, familyIndex: number) => void;
  onSublaneShadeChange: (sublaneId: string, shadeIndex: number) => void;
}

export default function SizingView({
  swimlanes,
  bars,
  sizes,
  onSizeChange,
  onResetSizes,
  swimlaneFamilyIndices,
  sublaneShadeIndices,
  onSwimlaneColorChange,
  onSublaneShadeChange,
}: SizingViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setDims({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const swimlanePts = swimlanes.map(sl => ({
    id: sl.id,
    pts: Math.max(
      bars
        .filter(b => b.swimlaneId === sl.id && sizes[b.id])
        .reduce((s, b) => s + SIZE_POINTS[sizes[b.id] as TShirtSize], 0),
      1,
    ),
  }));

  const swimlaneTiles = computeLayout(swimlanePts, { x: 0, y: 0, w: dims.w, h: dims.h });

  const groups = swimlaneTiles.map(slTile => {
    const sl = swimlanes.find(s => s.id === slTile.id)!;
    const slBars = bars.filter(b => b.swimlaneId === sl.id);
    const subItems = slBars.map(b => ({ id: b.id, pts: sizePoints(sizes[b.id]) }));
    const subTiles = computeLayout(subItems, slTile);
    return { swimlane: sl, slTile, subTiles, bars: slBars };
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="relative flex-1 min-h-0 bg-gray-50 p-3">
        {/* Reset button */}
        <div className="absolute top-3 right-3 z-20">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1.5">
                <RotateCcw className="size-3" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset size chart?</AlertDialogTitle>
                <AlertDialogDescription>
                  All T-shirt sizes will be cleared. Every swimlane and sub-lane will return to
                  equal, unset sizing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onResetSizes}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div ref={containerRef} className="relative w-full h-full">
          {dims.w > 0 &&
            groups.map(({ swimlane, slTile, subTiles, bars: slBars }) => {
              const familyIdx = swimlaneFamilyIndices[swimlane.id] ?? 0;
              const family = COLOR_FAMILIES[familyIdx];

              return (
                <div key={swimlane.id}>
                  {/* Sub-lane cells */}
                  {subTiles.map(tile => {
                    const bar = slBars.find(b => b.id === tile.id)!;
                    const size = sizes[bar.id] as TShirtSize | undefined;
                    const showFullLabel = tile.w >= 72 && tile.h >= 44;
                    const showSizeOnly = !showFullLabel && (tile.w >= 36 || tile.h >= 36);
                    const showMenu = tile.w >= 28 && tile.h >= 28;
                    const cellColor = bar.color;

                    return (
                      <TileCell
                        key={tile.id}
                        tile={tile}
                        bar={bar}
                        size={size}
                        sizes={sizes}
                        cellColor={cellColor}
                        family={family}
                        showFullLabel={showFullLabel}
                        showSizeOnly={showSizeOnly}
                        showMenu={showMenu}
                        sublaneShadeIndices={sublaneShadeIndices}
                        onSizeChange={onSizeChange}
                        onSublaneShadeChange={onSublaneShadeChange}
                      />
                    );
                  })}

                  {/* Swimlane group border */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: slTile.x,
                      top: slTile.y,
                      width: slTile.w,
                      height: slTile.h,
                      boxShadow: 'inset 0 0 0 3px white',
                      zIndex: 10,
                    }}
                  />

                  {/* Swimlane label + ··· menu */}
                  <div
                    className="absolute flex items-center gap-1"
                    style={{ left: slTile.x + 6, top: slTile.y + 6, zIndex: 11 }}
                  >
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-bold text-white rounded-sm leading-tight max-w-[120px] truncate"
                      style={{ backgroundColor: swimlane.color }}
                    >
                      {swimlane.name}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center justify-center w-5 h-5 rounded bg-black/20 hover:bg-black/40 text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity">
                          <MoreHorizontal className="size-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Color</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {COLOR_FAMILIES.map((fam, idx) => (
                              <DropdownMenuItem
                                key={idx}
                                onClick={() => onSwimlaneColorChange(swimlane.id, idx)}
                                className={familyIdx === idx ? 'font-semibold' : ''}
                              >
                                <span
                                  className="w-3 h-3 rounded-sm flex-shrink-0"
                                  style={{ backgroundColor: fam.bars[DEFAULT_SHADE_INDEX] }}
                                />
                                {fam.name}
                                {familyIdx === idx ? ' ✓' : ''}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Reset lane sizes</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {SIZE_SEQUENCE.filter((s): s is TShirtSize => s !== null).map(s => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => slBars.forEach(b => onSizeChange(b.id, s))}
                              >
                                Set all to {s}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => slBars.forEach(b => onSizeChange(b.id, null))}
                            >
                              Unset all
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <p className="text-xs text-gray-400 px-3 py-1.5 flex-shrink-0 border-t border-gray-100">
        Click any cell to cycle: S · M · L · XL · XXL · XS · XXS · unset
      </p>
    </div>
  );
}
