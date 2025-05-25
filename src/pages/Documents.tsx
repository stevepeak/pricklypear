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
} from "@/components/ui/dialog";
import { Download, Trash2, Search, Plus, FileText } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentUploader } from "@/components/DocumentUploader";
import { getDocuments, deleteDocument } from "@/services/documentService";
import type { Document } from "@/types/document";
import { formatThreadTimestamp } from "@/utils/formatTimestamp";

export default function Documents() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

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

  const getFileType = (filename: string) => {
    const ext = filename.toLowerCase().split(".").pop();
    switch (ext) {
      case "pdf":
        return "PDF";
      case "docx":
        return "Word Document";
      default:
        return "Document";
    }
  };

  const filtered = documents.filter((doc) =>
    doc.original_filename.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4">
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
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                Loading documents...
              </TableCell>
            </TableRow>
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
                    <span>{doc.original_filename}</span>
                  </div>
                </TableCell>
                <TableCell>{getFileType(doc.original_filename)}</TableCell>
                <TableCell>
                  {formatThreadTimestamp(new Date(doc.created_at))}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Download ${doc.original_filename}`}
                    onClick={() => {
                      // TODO: Implement download functionality
                      alert("Download functionality coming soon!");
                    }}
                  >
                    <Download className="mr-1" size={16} />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    aria-label={`Delete ${doc.original_filename}`}
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="mr-1" size={16} />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
