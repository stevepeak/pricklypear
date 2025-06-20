import type { Database } from "@/integrations/supabase/types";

export type DocumentLabel = Database["public"]["Enums"]["document_label"];

export const DOCUMENT_LABEL_INFO: Record<
  DocumentLabel,
  { icon: string; color: string }
> = {
  Parenting: { icon: "👶", color: "blue" },
  Mediation: { icon: "🤝", color: "green" },
  Divorce: { icon: "💔", color: "red" },
  Evidence: { icon: "📁", color: "orange" },
  CourtOrder: { icon: "🏛️", color: "gray" },
  Invoice: { icon: "🧾", color: "purple" },
  Receipt: { icon: "🧾", color: "teal" },
  Photo: { icon: "📷", color: "yellow" },
  Medical: { icon: "🏥", color: "rose" },
  School: { icon: "🎓", color: "indigo" },
  Travel: { icon: "✈️", color: "cyan" },
  Communication: { icon: "📨", color: "blue" },
  Legal: { icon: "⚖️", color: "gray" },
  Financial: { icon: "💰", color: "green" },
  Custody: { icon: "👨‍👩‍👧", color: "purple" },
  Schedule: { icon: "📅", color: "blue" },
  Agreement: { icon: "🤝", color: "green" },
  Insurance: { icon: "🛡️", color: "yellow" },
  Other: { icon: "📝", color: "gray" },
} as const;

export function getDocumentLabelInfo(label: DocumentLabel) {
  return DOCUMENT_LABEL_INFO[label];
}

export type Document = Database["public"]["Tables"]["documents"]["Row"];

export interface DocumentUploadResponse {
  status: "success" | "error";
  document_id?: string;
  word_count?: number;
  message: string;
  error?: string;
}
