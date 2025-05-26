import React from "react";
import { Bot, Loader2, MessageCircle, MessageCirclePlus } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

  // Use controlled state if external state is provided
  const dialogOpen =
    externalIsOpen !== undefined ? externalIsOpen : isDialogOpen;
  const setDialogOpen = externalOnOpenChange || setIsDialogOpen;

  // Custom hooks for connections and thread creation
  const { connections, isLoading: isLoadingContacts } = useConnections();
  const {
    newThreadTitle,
    setNewThreadTitle,
    selectedContactIds,
    setSelectedContactIds,
    selectedTopic,
    setSelectedTopic,
    isCreating,
    requireAiApproval,
    setRequireAiApproval,
    handleCreateThread,
    handleCreateAIChat,
    handleGenerateThread,
  } = useThreadCreation(onThreadCreated, () => setDialogOpen(false));

  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      setNewThreadTitle("");
      setSelectedContactIds([]);
      setSelectedTopic(undefined);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <MessageCirclePlus className="mr-2 h-4 w-4" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>
            Choose a conversation between you and contacts, or an AI chat.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="conversation" className="w-full mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="conversation" className="flex-1">
              <MessageCircle className="mr-2 h-4 w-4" /> Conversation
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="flex-1">
              <Bot className="mr-2 h-4 w-4" /> AI Chat
            </TabsTrigger>
          </TabsList>
          <TabsContent value="conversation">
            <CreateThreadForm
              newThreadTitle={newThreadTitle}
              setNewThreadTitle={setNewThreadTitle}
              selectedContactIds={selectedContactIds}
              setSelectedContactIds={setSelectedContactIds}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              connections={connections}
              isLoadingContacts={isLoadingContacts}
              isCreating={isCreating}
              requireAiApproval={requireAiApproval}
              setRequireAiApproval={setRequireAiApproval}
              onGenerate={() => handleGenerateThread(user)}
              isAdmin={user.email === "steve@peak.family"}
              onSubmit={() => handleCreateThread(user)}
              onCancel={() => handleDialogOpen(false)}
            />
          </TabsContent>
          <TabsContent value="ai-chat">
            <div className="py-8 text-center text-muted-foreground">
              <p className="mb-4">
                Start a new, private AI chat to ask questions with all the
                context from your threads and documents.
              </p>
              <Button
                onClick={() => handleCreateAIChat(user)}
                disabled={isCreating}
                className="w-2/3"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Start AI Chat
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;
