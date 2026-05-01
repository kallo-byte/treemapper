import { useMemo, useState, useEffect } from 'react';
import { Database, RotateCcw } from 'lucide-react';
import { COLOR_FAMILIES, DEFAULT_FAMILY_INDEX, DEFAULT_SHADE_INDEX } from '../core/color-families';
import { parseBullets } from './lib/parse-bullets';
import { useLocalStorage } from './lib/storage';
import type { Swimlane, TimelineBar, TShirtSize } from '../core/types';
import { SizingView } from '../core/SizingView';
import { SwimlaneFilter } from '../core/SwimlaneFilter';
import DataModal from './components/DataModal';
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

export default function App() {
  const [rawText, setRawText] = useLocalStorage<string>('treemapper:text', '');
  const [sizes, setSizes] = useLocalStorage<Record<string, string>>('treemapper:sizes', {});
  const [swimlaneColors, setSwimlaneColors] = useLocalStorage<Record<string, number>>(
    'treemapper:swimlane-colors',
    {},
  );
  const [sublaneShades, setSublaneShades] = useLocalStorage<Record<string, number>>(
    'treemapper:sublane-shades',
    {},
  );
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedSwimlaneIds, setSelectedSwimlaneIds] = useState<string[]>([]);

  const { swimlanes: parsedSwimlanes, sublanes: parsedSublanes } = useMemo(
    () => parseBullets(rawText),
    [rawText],
  );

  // Auto-assign color families to new swimlanes on first appearance
  useEffect(() => {
    const additions: Record<string, number> = {};
    parsedSwimlanes.forEach((sl, i) => {
      if (swimlaneColors[sl.id] === undefined) {
        additions[sl.id] = i % COLOR_FAMILIES.length;
      }
    });
    if (Object.keys(additions).length > 0) {
      setSwimlaneColors(prev => ({ ...prev, ...additions }));
    }
    // intentionally omitting swimlaneColors from deps to avoid loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedSwimlanes]);

  const swimlaneFamilyIndices = useMemo(() => {
    const result: Record<string, number> = {};
    parsedSwimlanes.forEach((sl, i) => {
      result[sl.id] = swimlaneColors[sl.id] ?? i % COLOR_FAMILIES.length;
    });
    return result;
  }, [parsedSwimlanes, swimlaneColors]);

  const sizingViewSwimlanes: Swimlane[] = parsedSwimlanes.map(sl => ({
    id: sl.id,
    name: sl.name,
    color: COLOR_FAMILIES[swimlaneFamilyIndices[sl.id] ?? DEFAULT_FAMILY_INDEX].bars[DEFAULT_SHADE_INDEX],
  }));

  const sizingViewBars: TimelineBar[] = parsedSublanes.map(sub => {
    const familyIdx = swimlaneFamilyIndices[sub.swimlaneId] ?? DEFAULT_FAMILY_INDEX;
    const shadeIdx = sublaneShades[sub.id] ?? DEFAULT_SHADE_INDEX;
    return {
      id: sub.id,
      swimlaneId: sub.swimlaneId,
      name: sub.name,
      color: COLOR_FAMILIES[familyIdx].bars[shadeIdx],
    };
  });

  // Drop any selected IDs that no longer exist in the parsed data
  useEffect(() => {
    const available = new Set(parsedSwimlanes.map(sl => sl.id));
    setSelectedSwimlaneIds(prev => prev.filter(id => available.has(id)));
  }, [parsedSwimlanes]);

  const hasSwimlaneFilter = selectedSwimlaneIds.length > 0;
  const selectedSwimlaneIdSet = new Set(selectedSwimlaneIds);

  function handleSizeChange(barId: string, size: TShirtSize | null) {
    setSizes(prev => {
      const next = { ...prev };
      if (size === null) delete next[barId];
      else next[barId] = size;
      return next;
    });
  }

  function handleSwimlaneColorChange(swimlaneId: string, familyIndex: number) {
    setSwimlaneColors(prev => ({ ...prev, [swimlaneId]: familyIndex }));
  }

  function handleSublaneShadeChange(sublaneId: string, shadeIndex: number) {
    setSublaneShades(prev => ({ ...prev, [sublaneId]: shadeIndex }));
  }

  const isEmpty = parsedSwimlanes.length === 0;

  return (
    <div className="antialiased h-screen flex flex-col font-sans">
      <nav className="flex items-center gap-4 px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <span className="font-semibold text-gray-900 text-base tracking-tight leading-none">
          Treemapper
        </span>
        <span className="text-sm text-gray-400 leading-none">
          T-shirt sizing visualizer
        </span>
        {!isEmpty && parsedSwimlanes.length >= 2 && (
          <SwimlaneFilter
            swimlanes={sizingViewSwimlanes}
            selectedIds={selectedSwimlaneIds}
            onChange={setSelectedSwimlaneIds}
          />
        )}
        <div className="ml-auto flex items-center gap-2">
          {!isEmpty && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <RotateCcw className="size-3.5" />
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
                  <AlertDialogAction onClick={() => setSizes({})}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsDataModalOpen(true)}
          >
            <Database className="size-3.5" />
            {isEmpty ? 'Add Data' : 'Edit Data'}
          </Button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Database className="size-5 text-gray-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">No data yet</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Add swimlanes and sublanes to get started. Swimlanes become regions; sublanes become
                cells you can size.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsDataModalOpen(true)}>
              Add Data
            </Button>
          </div>
        ) : (
          <SizingView
            swimlanes={sizingViewSwimlanes}
            bars={sizingViewBars}
            sizes={sizes}
            onSizeChange={handleSizeChange}
            onResetSizes={() => setSizes({})}
            swimlaneFamilyIndices={swimlaneFamilyIndices}
            sublaneShadeIndices={sublaneShades}
            onSwimlaneColorChange={handleSwimlaneColorChange}
            onSublaneShadeChange={handleSublaneShadeChange}
            visibleSwimlaneIds={hasSwimlaneFilter ? selectedSwimlaneIdSet : undefined}
          />
        )}
      </main>

      <DataModal
        open={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        currentText={rawText}
        onApply={text => {
          setRawText(text);
          setIsDataModalOpen(false);
        }}
      />
    </div>
  );
}
