import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';

interface DocumentUploaderProps {
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const { upload, status, progress, error } = useDocumentUpload();
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      if (rejectedFiles.length > 0) {
        setLocalError(
          'Invalid file type. Only PDF and DOCX files are supported.'
        );
        setFile(null);
        return;
      }

      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setLocalError('File size must be less than 10MB.');
        setFile(null);
        return;
      }

      setLocalError(null);
      setFile(file);
      upload(file, onUploadComplete);
    },
    [upload, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {status === 'idle' && !file && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop the document here' : 'Upload a document'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop a PDF or DOCX file here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOCX • Max size: 10MB
          </p>
        </div>
      )}

      {(status === 'uploading' || status === 'processing') && (
        <div className="border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">{file?.name}</p>
              <p className="text-sm text-muted-foreground">
                {status === 'uploading' ? 'Uploading...' : 'Extracting text...'}
              </p>
            </div>
          </div>
          <Progress value={progress} className="mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress}% complete
          </p>
        </div>
      )}

      {status === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Document successfully uploaded and processed! Text has been
            extracted and is ready for use.
          </AlertDescription>
        </Alert>
      )}

      {(status === 'error' || localError) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error ?? localError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
