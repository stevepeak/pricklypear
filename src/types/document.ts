export interface Document {
  id: string;
  user_id: string;
  file_path: string;
  original_filename: string;
  extracted_text: string;
  embedding?: number[];
  word_count: number;
  created_at: string;
  updated_at?: string;
}

export interface DocumentUploadResponse {
  status: "success" | "error";
  document_id?: string;
  word_count?: number;
  message: string;
  error?: string;
}
