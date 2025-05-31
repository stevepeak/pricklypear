import React from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const demoModeSchema = z.object({
  enabled: z.boolean(),
  messageFrequency: z.number().min(1).max(60),
});

type DemoModeSettings = z.infer<typeof demoModeSchema>;

const DEFAULT_SETTINGS: DemoModeSettings = {
  enabled: false,
  messageFrequency: 5,
};

interface DemoModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModeDialog({ open, onOpenChange }: DemoModeDialogProps) {
  const [settings, setSettings] = React.useState<DemoModeSettings>(() => {
    const stored = localStorage.getItem("demoModeSettings");
    if (stored) {
      try {
        return demoModeSchema.parse(JSON.parse(stored));
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const handleSave = () => {
    try {
      const validated = demoModeSchema.parse(settings);
      localStorage.setItem("demoModeSettings", JSON.stringify(validated));
      onOpenChange(false);
    } catch (error) {
      console.error("Invalid demo mode settings:", error);
    }
  };

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
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
