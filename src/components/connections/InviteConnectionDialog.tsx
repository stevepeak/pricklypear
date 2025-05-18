import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Mail } from "lucide-react";

interface InviteConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string) => void;
  isInviting: boolean;
}

const InviteConnectionDialog: React.FC<InviteConnectionDialogProps> = ({
  open,
  onOpenChange,
  onInvite,
  isInviting,
}) => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const emailIsValid = isValidEmail(email);
  const showEmailWarning = touched && email.length > 0 && !emailIsValid;

  const handleInvite = () => {
    onInvite(email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite via Email</DialogTitle>
          <DialogDescription>
            Enter the email of the person you would like to add as a connection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            id="invite-email"
            placeholder="Enter email address"
            type="email"
            value={email}
            className="w-full"
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !isInviting &&
                email.trim() &&
                emailIsValid
              ) {
                handleInvite();
              }
            }}
          />
          {showEmailWarning && (
            <div className="text-red-500 text-xs mt-1">
              Please enter a valid email address.
            </div>
          )}
        </div>
        <DialogFooter>
          <div className="flex w-full justify-between items-center">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!email.trim() || isInviting || !emailIsValid}
            >
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send invitation
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteConnectionDialog;
