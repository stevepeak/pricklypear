import React from "react";
import { MessageCirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useConnections } from "@/hooks/useConnections";
import { useThreadCreation } from "@/hooks/useThreadCreation";
import CreateThreadForm from "./CreateThreadForm";
import type { Thread } from "@/types/thread";
import type { User } from "@supabase/supabase-js";

interface CreateThreadDialogProps {
  onThreadCreated: (newThread: Thread) => void;
  user: User;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateThreadDialog = ({
  onThreadCreated,
  user,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: CreateThreadDialogProps) => {
  // Internal state for dialog open status
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [requireAiApproval, setRequireAiApproval] = React.useState(true);

  // Use controlled state if external state is provided
  const dialogOpen =
    externalIsOpen !== undefined ? externalIsOpen : isDialogOpen;
  const setDialogOpen = externalOnOpenChange || setIsDialogOpen;

  // Custom hooks for connections and thread creation
  const { connections, isLoading: isLoadingContacts } = useConnections();
  const {
    newThreadTitle,
    setNewThreadTitle,
    selectedContactId,
    setSelectedContactId,
    selectedTopic,
    setSelectedTopic,
    isCreating,
    handleCreateThread,
  } = useThreadCreation(onThreadCreated, () => setDialogOpen(false));

  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      setNewThreadTitle("");
      setSelectedContactId("");
      setSelectedTopic(undefined);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageCirclePlus className="mr-2 h-4 w-4" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>
            Threads are focused conversations with specific topics and
            moderation rules. They help keep discussions on track and encourage
            quick resolution.
          </DialogDescription>
        </DialogHeader>

        <CreateThreadForm
          newThreadTitle={newThreadTitle}
          setNewThreadTitle={setNewThreadTitle}
          selectedContactId={selectedContactId}
          setSelectedContactId={setSelectedContactId}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          connections={connections}
          isLoadingContacts={isLoadingContacts}
          isCreating={isCreating}
          requireAiApproval={requireAiApproval}
          setRequireAiApproval={setRequireAiApproval}
          onSubmit={() => handleCreateThread(user, requireAiApproval)}
          onCancel={() => handleDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;
