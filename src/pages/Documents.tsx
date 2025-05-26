import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Download, Trash2, Search, Plus, FileText } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentUploader } from "@/components/DocumentUploader";
import {
  getDocuments,
  deleteDocument,
  updateDocumentTitle,
} from "@/services/documentService";
import type { Document } from "@/types/document";
import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { DocumentTableSkeleton } from "@/components/documents/DocumentTableSkeleton";
import { toast } from "sonner";

export default function Documents() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [renameDoc, setRenameDoc] = useState<Document | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const loadDocuments = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const docs = await getDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUploadComplete = () => {
    setIsUploadDialogOpen(false);
    loadDocuments();
  };

  const handleDelete = async (documentId: string) => {
    if (!user || !confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await deleteDocument(documentId, user.id);
      loadDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document");
    }
  };

  const handleRename = async () => {
    if (!user || !renameDoc) return;
    const trimmed = newTitle.trim();
    if (!trimmed) {
      toast("Title required", {
        description: "Please enter a document title.",
      });
      return;
    }

    try {
      await updateDocumentTitle(renameDoc.id, trimmed);
      toast("Document renamed", {
        description: "The document title has been updated.",
      });
      setRenameDoc(null);
      loadDocuments();
    } catch (error) {
      console.error("Failed to rename document:", error);
      toast("Error", { description: "Failed to rename document." });
    }
  };

  const filtered = documents.filter((doc) =>
    doc.original_filename.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between pr-4">
        <div className="flex w-full max-w-xs relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="pl-9 pr-3 h-9 border-none shadow-none focus-visible:ring-0"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            aria-label="Search"
          />
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto" size="sm" variant="default">
              <Plus className="mr-2" size={16} /> Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <DocumentUploader onUploadComplete={handleUploadComplete} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
              Name
            </TableHead>
            <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
              Uploaded
            </TableHead>
            <TableHead className="px-4 py-2 font-semibold whitespace-nowrap text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <DocumentTableSkeleton />
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                {search
                  ? "No documents found matching your search."
                  : "No documents uploaded yet."}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            setRenameDoc(doc);
                            setNewTitle(doc.original_filename);
                          }}
                        >
                          {doc.original_filename}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Click to edit title</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  {formatThreadTimestamp(new Date(doc.created_at))}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Download ${doc.original_filename}`}
                    onClick={() => {
                      // TODO: Implement download functionality
                      alert("Download functionality coming soon!");
                    }}
                  >
                    <Download className="mr-1" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${doc.original_filename}`}
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="mr-1" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog
        open={Boolean(renameDoc)}
        onOpenChange={(open) => {
          if (!open) setRenameDoc(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameDoc(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleRename}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
