import React from 'react';
import {
  Bot,
  Loader2,
  MessageCirclePlus,
  MessagesSquare,
  Headset,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useConnections } from '@/hooks/useConnections';
import { useThreadCreation } from '@/hooks/useThreadCreation';
import CreateThreadForm from './CreateThreadForm';
import type { Thread } from '@/types/thread';
import type { User } from '@supabase/supabase-js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
      setNewThreadTitle('');
      setSelectedContactIds([]);
      setSelectedTopic(undefined);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <MessageCirclePlus size={16} />
          <span className="hidden sm:inline">New Thread</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>
            Start a new conversation with your contacts, ask AI a question, or
            contact our support team.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="conversation" className="w-full mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="conversation" className="flex-1">
              <MessagesSquare className="mr-2 h-4 w-4" /> Chat
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="flex-1">
              <Bot className="mr-2 h-4 w-4" /> AI
            </TabsTrigger>
            <TabsTrigger value="customer-support" className="flex-1">
              <Headset className="mr-2 h-4 w-4" /> Support
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
              onGenerate={() => handleGenerateThread()}
              isAdmin={user.id === '09b77fc6-776c-4b4a-bd8c-96bb7997516e'}
              onSubmit={() => handleCreateThread()}
              onCancel={() => handleDialogOpen(false)}
            />
          </TabsContent>
          <TabsContent value="ai-chat">
            <div className="py-8 text-center text-muted-foreground">
              <p className="mb-4">
                Start a <strong>private</strong> AI chat to ask questions with
                context from your threads and documents.
              </p>
              <Button
                onClick={() => handleCreateAIChat()}
                disabled={isCreating}
                variant="success"
                data-testid="create-thread-button"
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
          <TabsContent value="customer-support">
            <CustomerSupportForm
              onThreadCreated={onThreadCreated}
              onClose={() => setDialogOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

function CustomerSupportForm({
  onThreadCreated,
  onClose,
}: {
  onThreadCreated: (thread: Thread) => void;
  onClose: () => void;
}) {
  const [isCreating, setIsCreating] = React.useState(false);
  const handleCreate = async () => {
    setIsCreating(true);
    const { createThread } = await import('@/services/threadService');
    const thread = await createThread({
      title: 'New Support Chat',
      type: 'customer_support',
      topic: 'other',
    });
    setIsCreating(false);
    if (thread) {
      onThreadCreated(thread);
      onClose();
    }
  };
  return (
    <div className="py-8 text-center text-muted-foreground">
      <p className="mb-4">
        Contact our support team for help with your account, billing, or
        technical issues.
      </p>
      <div>
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          variant="success"
          data-testid="create-thread-button"
          className="w-2/3 mt-2"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Headset className="mr-2 h-4 w-4" />
              Start Support Chat
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default CreateThreadDialog;
