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
import {
  Download,
  Trash2,
  Search,
  Plus,
  FileText,
  Tags,
  ListFilter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentUploader } from "@/components/DocumentUploader";
import {
  getDocuments,
  deleteDocument,
  updateDocumentTitle,
  updateDocumentLabels,
} from "@/services/documentService";
import type { Document, DocumentLabel } from "@/types/document";
import DocumentLabelsDialog from "@/components/documents/DocumentLabelsDialog";
import { DOCUMENT_LABEL_INFO, getDocumentLabelInfo } from "@/types/document";
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
  const [labelDoc, setLabelDoc] = useState<Document | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<DocumentLabel[]>([]);
  const [filterLabels, setFilterLabels] = useState<DocumentLabel[]>([]);

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

  const openLabelDialog = (doc: Document) => {
    setLabelDoc(doc);
    setSelectedLabels(doc.labels ?? []);
  };

  const handleSaveLabels = async (labels: DocumentLabel[]) => {
    if (!user || !labelDoc) return;
    try {
      await updateDocumentLabels(labelDoc.id, labels);
      toast("Labels updated", { description: "Document labels saved." });
      setLabelDoc(null);
      loadDocuments();
    } catch (error) {
      console.error("Failed to update labels:", error);
      toast("Error", { description: "Failed to update labels." });
    }
  };

  const toggleFilterLabel = (label: DocumentLabel) => {
    setFilterLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.filename
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLabels =
      filterLabels.length === 0 ||
      (doc.labels ?? []).some((l) => filterLabels.includes(l));
    return matchesSearch && matchesLabels;
  });

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
        <div className="flex gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="focus-visible:ring-0"
              >
                <ListFilter />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {Object.keys(DOCUMENT_LABEL_INFO).map((key) => {
                    const label = key as DocumentLabel;
                    const info = getDocumentLabelInfo(label);
                    return (
                      <DropdownMenuCheckboxItem
                        key={label}
                        checked={filterLabels.includes(label)}
                        onCheckedChange={() => toggleFilterLabel(label)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <span className="mr-2">{info.icon}</span>
                        {label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="default">
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
            <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
              Labels
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
                            setNewTitle(doc.filename);
                          }}
                        >
                          {doc.filename}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Click to edit title</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  {formatThreadTimestamp(new Date(doc.created_at))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center flex-wrap gap-1">
                    {doc.labels?.map((label) => {
                      const info = getDocumentLabelInfo(label);
                      return (
                        <Tooltip key={label}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className={`bg-${info.color}-100 text-${info.color}-800 border-${info.color}-200`}
                            >
                              {info.icon}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Edit labels"
                      onClick={() => openLabelDialog(doc)}
                    >
                      <Tags className="size-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Download ${doc.filename}`}
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
                    aria-label={`Delete ${doc.filename}`}
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
      <DocumentLabelsDialog
        open={Boolean(labelDoc)}
        onOpenChange={(open) => {
          if (!open) setLabelDoc(null);
        }}
        labels={selectedLabels}
        onSave={handleSaveLabels}
      />
    </div>
  );
}
