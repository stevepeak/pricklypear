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
import { Download, Trash2, Search, Plus } from "lucide-react";
import React, { useState } from "react";

// Sample documents (easy to remove)
const SAMPLE_DOCUMENTS = [
  {
    id: "1",
    name: "Parenting Plan.pdf",
    type: "PDF",
    uploaded: "2024-05-01",
  },
  {
    id: "2",
    name: "Court Order.docx",
    type: "Word Document",
    uploaded: "2024-04-15",
  },
];

export default function Documents() {
  const [search, setSearch] = useState("");
  // In a real app, this would be state, but for demo just filter the sample
  const filtered = SAMPLE_DOCUMENTS.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase()),
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
        <Button className="ml-auto" size="sm" variant="default">
          <Plus className="mr-2" size={16} /> Upload
        </Button>
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
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No documents found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.uploaded}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download className="mr-1" size={16} />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    aria-label={`Delete ${doc.name}`}
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
