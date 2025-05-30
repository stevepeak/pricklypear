import { THREAD_TOPIC_INFO, type ThreadTopic } from "@/types/thread";
import { Link } from "react-router-dom";
import { Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Connection } from "@/types/connection";
import React from "react";
import { Switch } from "../ui/switch";

interface CreateThreadFormProps {
  newThreadTitle: string;
  setNewThreadTitle: (title: string) => void;
  selectedContactIds: string[];
  setSelectedContactIds: (contactIds: string[]) => void;
  selectedTopic?: ThreadTopic;
  setSelectedTopic?: (topic: ThreadTopic | undefined) => void;
  connections: Connection[];
  isLoadingContacts: boolean;
  isCreating: boolean;
  onSubmit: () => void;
  onGenerate?: () => void;
  onCancel: () => void;
  requireAiApproval: boolean;
  setRequireAiApproval: (value: boolean) => void;
  isAdmin?: boolean;
}

const CreateThreadForm = ({
  newThreadTitle,
  setNewThreadTitle,
  selectedContactIds,
  setSelectedContactIds,
  selectedTopic,
  setSelectedTopic,
  connections,
  isLoadingContacts,
  isCreating,
  onSubmit,
  onGenerate,
  onCancel,
  requireAiApproval,
  setRequireAiApproval,
  isAdmin,
}: CreateThreadFormProps) => {
  const topicInfo = THREAD_TOPIC_INFO;
  const [showTopicError, setShowTopicError] = React.useState(false);

  return (
    <div className="space-y-4 mt-2">
      <label className="text-sm font-medium mb-1 block">Title</label>
      <Input
        placeholder="What is this thread about?"
        value={newThreadTitle}
        onChange={(e) => setNewThreadTitle(e.target.value)}
        maxLength={50}
      />

      {setSelectedTopic && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Topic</Label>
          <RadioGroup
            value={selectedTopic}
            onValueChange={(value) => {
              setSelectedTopic(value as ThreadTopic);
              setShowTopicError(false);
            }}
            className="grid grid-cols-2 gap-2"
          >
            {Object.entries(topicInfo).map(([value, info]) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={`topic-${value}`} />
                <Label
                  htmlFor={`topic-${value}`}
                  className="text-sm flex items-center gap-1"
                >
                  <span>{info.icon}</span>
                  {info.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {showTopicError && (
            <div className="text-xs text-red-500">Please select a topic.</div>
          )}
        </div>
      )}

      <label className="text-sm font-medium mb-1 block">Participants</label>

      {isLoadingContacts ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
          <span className="text-sm">Loading contacts...</span>
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-2 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">
            No contacts available. Add contacts first.
          </p>
          <Button variant="link" size="sm" asChild className="mt-1">
            <Link to="/connections">Go to Connections</Link>
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between normal-case">
              {selectedContactIds.length === 0
                ? "Select participants"
                : selectedContactIds.length === 1
                  ? connections.find(
                      (c) => c.otherUserId === selectedContactIds[0],
                    )?.name ||
                    connections.find(
                      (c) => c.otherUserId === selectedContactIds[0],
                    )?.invitee_email ||
                    "1 participant"
                  : `${selectedContactIds.length} people`}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {connections.map((connection) => (
              <DropdownMenuCheckboxItem
                key={connection.otherUserId}
                checked={selectedContactIds.includes(connection.otherUserId)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedContactIds([
                      ...selectedContactIds,
                      connection.otherUserId,
                    ]);
                  } else {
                    setSelectedContactIds(
                      selectedContactIds.filter(
                        (id) => id !== connection.otherUserId,
                      ),
                    );
                  }
                }}
                onSelect={(e) => e.preventDefault()}
                className="normal-case"
              >
                {connection.name || connection.invitee_email}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <label className="text-sm font-medium mb-1 block">Controls</label>

      <div className="flex items-center space-x-2 mt-4">
        <Switch
          id="require-ai-rephrased"
          checked={requireAiApproval}
          onCheckedChange={setRequireAiApproval}
        />
        <Label htmlFor="require-ai-approval">
          {requireAiApproval
            ? "AI must approve all messages"
            : "AI will only suggest change"}
        </Label>
      </div>

      <div className="flex flex-row justify-between items-center mt-4">
        <div className="flex">
          <Button variant="outline" onClick={onCancel} disabled={isCreating}>
            Cancel
          </Button>
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <Button
              onClick={onGenerate}
              disabled={isCreating}
              variant="secondary"
            >
              Generate
            </Button>
          )}
          <Button
            onClick={() => {
              if (!selectedTopic) {
                setShowTopicError(true);
                return;
              }
              onSubmit();
            }}
            disabled={
              !newThreadTitle.trim() ||
              selectedContactIds.length === 0 ||
              !selectedTopic ||
              isCreating
            }
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateThreadForm;
