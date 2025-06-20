import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog.js";

interface RequestCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestClose: () => void;
  isRequesting: boolean;
}

export function RequestCloseDialog({
  open,
  onOpenChange,
  onRequestClose,
  isRequesting,
}: RequestCloseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to close thread</DialogTitle>
          <DialogDescription>
            Are you sure you want to request to close this thread?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={onRequestClose}
            disabled={isRequesting}
            variant="default"
          >
            {isRequesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Make request to close"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
