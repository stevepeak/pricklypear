import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DOCUMENT_LABEL_INFO,
  DocumentLabel,
  getDocumentLabelInfo,
} from '@/types/document';

interface DocumentLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: DocumentLabel[];
  onSave: (labels: DocumentLabel[]) => void;
}

export default function DocumentLabelsDialog({
  open,
  onOpenChange,
  labels,
  onSave,
}: DocumentLabelsDialogProps) {
  const [selected, setSelected] = useState<DocumentLabel[]>(labels);

  useEffect(() => {
    setSelected(labels);
  }, [labels]);

  const toggle = (label: DocumentLabel) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Labels</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(DOCUMENT_LABEL_INFO).map((key) => {
              const label = key as DocumentLabel;
              const info = getDocumentLabelInfo(label);
              return (
                <label
                  key={label}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(label)}
                    onCheckedChange={() => toggle(label)}
                    className="size-4"
                  />
                  <span className="flex items-center gap-1">
                    <span>{info.icon}</span>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
