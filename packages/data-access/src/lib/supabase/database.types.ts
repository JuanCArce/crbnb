/**
 * Tipos de la base de datos Supabase.
 *
 * Este archivo se regenera automáticamente con:
 *   pnpm db:types
 *
 * Requiere Supabase CLI y conexión a la DB local o remota.
 * Para regenerar: ver scripts en package.json raíz.
 *
 * Por ahora contiene un placeholder mínimo hasta que se aplique la migración 0001.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          language: 'es' | 'en';
          kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
          kyc_doc_url: string | null;
          kyc_verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          language?: 'es' | 'en';
          kyc_status?: 'none' | 'pending' | 'verified' | 'rejected';
          kyc_doc_url?: string | null;
          kyc_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      hosts: {
        Row: {
          id: string;
          profile_id: string;
          slug: string;
          bio_es: string | null;
          bio_en: string | null;
          payout_provider: string | null;
          payout_account_ref: string | null;
          subscription_tier: 'free' | 'pro';
          subscription_expires_at: string | null;
          is_suspended: boolean;
          suspended_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          slug: string;
          bio_es?: string | null;
          bio_en?: string | null;
          payout_provider?: string | null;
          payout_account_ref?: string | null;
          subscription_tier?: 'free' | 'pro';
          subscription_expires_at?: string | null;
          is_suspended?: boolean;
          suspended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['hosts']['Insert']>;
      };
      admin_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_ip: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          diff: Json | null;
          created_at: string;
        };
      };
    };
    Views: {
      profiles_public: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
          kyc_verified_at: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}