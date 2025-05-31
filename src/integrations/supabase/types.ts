export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      connections: {
        Row: {
          connected_user_id: string | null
          created_at: string
          id: string
          invitee_email: string | null
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_user_id?: string | null
          created_at?: string
          id?: string
          invitee_email?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_user_id?: string | null
          created_at?: string
          id?: string
          invitee_email?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_connected_user_id_fkey"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          embedding: string | null
          extracted_text: string | null
          file_path: string
          filename: string
          id: string
          labels: Database["public"]["Enums"]["document_label"][] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          extracted_text?: string | null
          file_path: string
          filename: string
          id?: string
          labels?: Database["public"]["Enums"]["document_label"][] | null
          user_id: string
        }
        Update: {
          created_at?: string
          embedding?: string | null
          extracted_text?: string | null
          file_path?: string
          filename?: string
          id?: string
          labels?: Database["public"]["Enums"]["document_label"][] | null
          user_id?: string
        }
        Relationships: []
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          details: Json | null
          id: string
          text: string
          thread_id: string
          timestamp: string
          type: Database["public"]["Enums"]["message_type"]
          user_id: string
        }
        Insert: {
          details?: Json | null
          id?: string
          text: string
          thread_id: string
          timestamp?: string
          type?: Database["public"]["Enums"]["message_type"]
          user_id: string
        }
        Update: {
          details?: Json | null
          id?: string
          text?: string
          thread_id?: string
          timestamp?: string
          type?: Database["public"]["Enums"]["message_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          notifications: Json | null
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          notifications?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notifications?: Json | null
        }
        Relationships: []
      }
      thread_participants: {
        Row: {
          created_at: string
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          ai: boolean
          controls: Json | null
          created_at: string
          created_by: string
          id: string
          status: Database["public"]["Enums"]["thread_status"]
          summary: string | null
          title: string
          topic: Database["public"]["Enums"]["thread_topic"]
          type: Database["public"]["Enums"]["thread_type"]
        }
        Insert: {
          ai?: boolean
          controls?: Json | null
          created_at?: string
          created_by: string
          id?: string
          status?: Database["public"]["Enums"]["thread_status"]
          summary?: string | null
          title: string
          topic?: Database["public"]["Enums"]["thread_topic"]
          type?: Database["public"]["Enums"]["thread_type"]
        }
        Update: {
          ai?: boolean
          controls?: Json | null
          created_at?: string
          created_by?: string
          id?: string
          status?: Database["public"]["Enums"]["thread_status"]
          summary?: string | null
          title?: string
          topic?: Database["public"]["Enums"]["thread_topic"]
          type?: Database["public"]["Enums"]["thread_type"]
        }
        Relationships: [
          {
            foreignKeyName: "threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      create_thread: {
        Args:
          | {
              title: string
              type: Database["public"]["Enums"]["thread_type"]
              topic: Database["public"]["Enums"]["thread_topic"]
            }
          | {
              title: string
              type: Database["public"]["Enums"]["thread_type"]
              topic: Database["public"]["Enums"]["thread_topic"]
              controls: Json
              participant_ids: string[]
            }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_thread_participant: {
        Args: { thread_id: string; user_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "declined" | "disabled"
      document_label:
        | "Parenting"
        | "Mediation"
        | "Divorce"
        | "Evidence"
        | "CourtOrder"
        | "Invoice"
        | "Receipt"
        | "Photo"
        | "Medical"
        | "School"
        | "Travel"
        | "Communication"
        | "Legal"
        | "Financial"
        | "Custody"
        | "Schedule"
        | "Agreement"
        | "Insurance"
        | "Other"
      message_type:
        | "user_message"
        | "request_close"
        | "close_accepted"
        | "close_declined"
        | "ai_message"
        | "customer_support"
      thread_status: "Open" | "Closed" | "Archived" | "(empty)"
      thread_topic:
        | "travel"
        | "parenting_time"
        | "health"
        | "education"
        | "activity"
        | "legal"
        | "other"
        | "expense"
      thread_type: "ai_chat" | "customer_support" | "default"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export const Constants = {
  public: {
    Enums: {
      connection_status: ["pending", "accepted", "declined", "disabled"],
      document_label: [
        "Parenting",
        "Mediation",
        "Divorce",
        "Evidence",
        "CourtOrder",
        "Invoice",
        "Receipt",
        "Photo",
        "Medical",
        "School",
        "Travel",
        "Communication",
        "Legal",
        "Financial",
        "Custody",
        "Schedule",
        "Agreement",
        "Insurance",
        "Other",
      ],
      message_type: [
        "user_message",
        "request_close",
        "close_accepted",
        "close_declined",
        "ai_message",
        "customer_support",
      ],
      thread_status: ["Open", "Closed", "Archived", "(empty)"],
      thread_topic: [
        "travel",
        "parenting_time",
        "health",
        "education",
        "activity",
        "legal",
        "other",
        "expense",
      ],
      thread_type: ["ai_chat", "customer_support", "default"],
    },
  },
} as const
