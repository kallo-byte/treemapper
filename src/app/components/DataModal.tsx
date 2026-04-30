import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PLACEHOLDER = `Platform
- Infrastructure
- Core Services

Product
- Mobile App
- Web App

Research`;

interface DataModalProps {
  open: boolean;
  onClose: () => void;
  currentText: string;
  onApply: (text: string) => void;
}

export default function DataModal({ open, onClose, currentText, onApply }: DataModalProps) {
  const [draft, setDraft] = useState(currentText);

  useEffect(() => {
    if (open) setDraft(currentText);
  }, [open, currentText]);

  function handleApply() {
    onApply(draft);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add / Edit Data</DialogTitle>
          <DialogDescription>
            Plain lines are swimlanes. Lines starting with{' '}
            <code className="font-mono bg-muted px-1 rounded text-xs">- </code> are sublanes under
            the most recent swimlane. Empty lines are ignored. Third-level nesting is not supported.
          </DialogDescription>
        </DialogHeader>

        <textarea
          className="w-full h-64 font-mono text-sm p-3 rounded-md border border-border bg-input-background resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          autoComplete="off"
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
