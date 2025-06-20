import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateDemoMessage } from '@/services/messageService/generateDemoMessage';

type DemoModeSettings = {
  enabled: boolean;
  messageFrequency: number;
};

const DEFAULT_SETTINGS: DemoModeSettings = {
  enabled: false,
  messageFrequency: 5,
};

interface DemoModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModeDialog({ open, onOpenChange }: DemoModeDialogProps) {
  const [settings, setSettings] =
    React.useState<DemoModeSettings>(DEFAULT_SETTINGS);

  // Effect to handle demo message generation
  React.useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (settings.enabled) {
      // Generate a message immediately when enabled
      generateDemoMessage();

      // Set up interval for periodic message generation
      intervalId = setInterval(() => {
        generateDemoMessage();
      }, settings.messageFrequency * 1000);
    }

    // Cleanup interval when component unmounts or settings change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [settings.enabled, settings.messageFrequency]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demo Mode Settings</DialogTitle>
          <DialogDescription>
            Configure demo mode settings for automated message generation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="demo-mode">Enable Demo Mode</Label>
            <Switch
              id="demo-mode"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message-frequency">
              Message Frequency (seconds)
            </Label>
            <Input
              id="message-frequency"
              type="number"
              min={1}
              max={60}
              value={settings.messageFrequency}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  messageFrequency: parseInt(e.target.value) || 5,
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
