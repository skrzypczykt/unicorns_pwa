// TypeScript types for Supabase database schema
// This file defines the database structure for type safety

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          role: 'user' | 'trainer' | 'admin' | 'external_trainer'
          balance: number
          balance_updated_at: string | null
          created_at: string
          updated_at: string
          is_association_member: boolean
          association_member_since: string | null
          gdpr_consent_date: string | null
          sports_terms_accepted_date: string | null
          membership_fee_plan: 'monthly' | 'yearly'
          last_membership_charge: string | null
        }
        Insert: {
          id: string
          email: string
          display_name: string
          role?: 'user' | 'trainer' | 'admin' | 'external_trainer'
          balance?: number
          balance_updated_at?: string | null
          created_at?: string
          updated_at?: string
          is_association_member?: boolean
          association_member_since?: string | null
          gdpr_consent_date?: string | null
          sports_terms_accepted_date?: string | null
          membership_fee_plan?: 'monthly' | 'yearly'
          last_membership_charge?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          role?: 'user' | 'trainer' | 'admin' | 'external_trainer'
          balance?: number
          balance_updated_at?: string | null
          created_at?: string
          updated_at?: string
          is_association_member?: boolean
          association_member_since?: string | null
          gdpr_consent_date?: string | null
          sports_terms_accepted_date?: string | null
          membership_fee_plan?: 'monthly' | 'yearly'
          last_membership_charge?: string | null
        }
      }
      activity_types: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_url: string | null
          whatsapp_group_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_url?: string | null
          whatsapp_group_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          whatsapp_group_url?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          name: string
          description: string | null
          activity_type_id: string | null
          trainer_id: string
          date_time: string
          duration_minutes: number
          duration_description: string | null
          max_participants: number
          cost: number
          cancellation_hours: number
          location: string
          status: 'scheduled' | 'completed' | 'cancelled'
          is_special_event: boolean
          whatsapp_group_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          activity_type_id?: string | null
          trainer_id: string
          date_time: string
          duration_minutes: number
          duration_description?: string | null
          max_participants: number
          cost: number
          cancellation_hours?: number
          location: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          is_special_event?: boolean
          whatsapp_group_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          activity_type_id?: string | null
          trainer_id?: string
          date_time?: string
          duration_minutes?: number
          duration_description?: string | null
          max_participants?: number
          cost?: number
          cancellation_hours?: number
          location?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          is_special_event?: boolean
          whatsapp_group_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          registered_at: string
          status: 'registered' | 'cancelled' | 'attended' | 'no_show'
          can_cancel_until: string
          cancelled_at: string | null
          payment_processed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          registered_at?: string
          status?: 'registered' | 'cancelled' | 'attended' | 'no_show'
          can_cancel_until: string
          cancelled_at?: string | null
          payment_processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          registered_at?: string
          status?: 'registered' | 'cancelled' | 'attended' | 'no_show'
          can_cancel_until?: string
          cancelled_at?: string | null
          payment_processed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          registration_id: string
          marked_by: string
          status: 'present' | 'absent'
          marked_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          registration_id: string
          marked_by: string
          status: 'present' | 'absent'
          marked_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          registration_id?: string
          marked_by?: string
          status?: 'present' | 'absent'
          marked_at?: string
          notes?: string | null
        }
      }
      balance_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          balance_before: number
          balance_after: number
          type: 'manual_credit' | 'manual_debit' | 'class_payment' | 'cancellation_refund'
          reference_id: string | null
          description: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          balance_before: number
          balance_after: number
          type: 'manual_credit' | 'manual_debit' | 'class_payment' | 'cancellation_refund'
          reference_id?: string | null
          description: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          // Transactions are immutable - no updates allowed
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          // Audit log is immutable - no updates allowed
        }
      }
      association_news: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          published_at: string
          expires_at: string | null
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          published_at?: string
          expires_at?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          published_at?: string
          expires_at?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      association_documents: {
        Row: {
          id: string
          title: string
          description: string | null
          document_url: string
          category: 'statute' | 'resolution' | 'report' | 'other'
          uploaded_by: string
          upload_date: string
          file_size_kb: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          document_url: string
          category: 'statute' | 'resolution' | 'report' | 'other'
          uploaded_by: string
          upload_date?: string
          file_size_kb?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          document_url?: string
          category?: 'statute' | 'resolution' | 'report' | 'other'
          uploaded_by?: string
          upload_date?: string
          file_size_kb?: number | null
          created_at?: string
        }
      }
      association_polls: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string
          start_date: string
          end_date: string
          is_active: boolean
          poll_type: 'resolution' | 'survey' | 'other'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_by: string
          start_date?: string
          end_date: string
          is_active?: boolean
          poll_type?: 'resolution' | 'survey' | 'other'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_by?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          poll_type?: 'resolution' | 'survey' | 'other'
          created_at?: string
        }
      }
      association_poll_options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_text?: string
          display_order?: number
          created_at?: string
        }
      }
      association_poll_votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id: string
          voted_at?: string
        }
        Update: {
          // Votes are immutable - no updates allowed
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_participant_count: {
        Args: {
          activity_uuid: string
        }
        Returns: number
      }
      is_activity_full: {
        Args: {
          activity_uuid: string
        }
        Returns: boolean
      }
      calculate_cancellation_deadline: {
        Args: {
          activity_uuid: string
        }
        Returns: string
      }
      get_poll_results: {
        Args: {
          poll_uuid: string
        }
        Returns: Array<{
          option_id: string
          option_text: string
          vote_count: number
        }>
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
