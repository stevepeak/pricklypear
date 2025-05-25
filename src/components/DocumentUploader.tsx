import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentUploaderProps {
  onUploadComplete?: (documentId: string) => void;
}

interface UploadState {
  file: File | null;
  progress: number;
  status: "idle" | "uploading" | "processing" | "success" | "error";
  error?: string;
  documentId?: string;
}

export function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const { user } = useAuth();
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: "idle",
  });

  const uploadFile = useCallback(
    async (file: File) => {
      if (!user) return;

      try {
        // Upload to Supabase Storage
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        setUploadState((prev) => ({
          ...prev,
          status: "processing",
          progress: 50,
        }));

        // Call Edge Function to extract text
        const { data: extractData, error: extractError } =
          await supabase.functions.invoke("extract-doc-text", {
            body: {
              user_id: user.id,
              file_path: uploadData.path,
              original_filename: file.name,
            },
            headers: {
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
          });

        if (extractError) throw extractError;

        setUploadState((prev) => ({
          ...prev,
          status: "success",
          progress: 100,
          documentId: extractData.document_id,
        }));

        onUploadComplete?.(extractData.document_id);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadState((prev) => ({
          ...prev,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        }));
      }
    },
    [user, onUploadComplete],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      if (rejectedFiles.length > 0) {
        setUploadState({
          file: null,
          progress: 0,
          status: "error",
          error: "Invalid file type. Only PDF and DOCX files are supported.",
        });
        return;
      }

      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setUploadState({
          file: null,
          progress: 0,
          status: "error",
          error: "File size must be less than 10MB.",
        });
        return;
      }

      setUploadState({
        file,
        progress: 0,
        status: "uploading",
      });

      // Auto-upload immediately
      uploadFile(file);
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {uploadState.status === "idle" && !uploadState.file && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? "Drop the document here" : "Upload a document"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop a PDF or DOCX file here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOCX • Max size: 10MB
          </p>
        </div>
      )}

      {(uploadState.status === "uploading" ||
        uploadState.status === "processing") && (
        <div className="border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">{uploadState.file?.name}</p>
              <p className="text-sm text-muted-foreground">
                {uploadState.status === "uploading"
                  ? "Uploading..."
                  : "Extracting text..."}
              </p>
            </div>
          </div>
          <Progress value={uploadState.progress} className="mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            {uploadState.progress}% complete
          </p>
        </div>
      )}

      {uploadState.status === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Document successfully uploaded and processed! Text has been
            extracted and is ready for use.
          </AlertDescription>
        </Alert>
      )}

      {uploadState.status === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {uploadState.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
