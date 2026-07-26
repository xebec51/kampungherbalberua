/**
 * Hand-written to match supabase/migrations/*_create_profiles_and_plants.sql.
 * Regenerate this file (e.g. `npx supabase gen types typescript`) once the
 * repository is linked to a real Supabase project, then reconcile any drift.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "viewer" | "editor" | "validator" | "admin";

export type ContentStatus = "draft" | "pending_review" | "published" | "archived";

export type ValidationStatus =
  | "data_demonstrasi"
  | "pending"
  | "verified"
  | "rejected";

export type PlantCategory = "rimpang" | "daun" | "bunga" | "batang" | "lainnya";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: AppRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: AppRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          role?: AppRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plants: {
        Row: {
          id: string;
          plant_code: string | null;
          slug: string;
          local_name: string;
          scientific_name: string | null;
          other_names: string[];
          category: PlantCategory;
          short_description: string;
          description: string;
          used_parts: string[];
          traditional_uses: string[];
          preparation: string[];
          care_instructions: string[];
          warnings: string[];
          image_path: string | null;
          location_status: string | null;
          source_notes: string | null;
          validator_id: string | null;
          validator_name: string | null;
          validation_status: ValidationStatus;
          content_status: ContentStatus;
          featured: boolean;
          published_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plant_code?: string | null;
          slug: string;
          local_name: string;
          scientific_name?: string | null;
          other_names?: string[];
          category: PlantCategory;
          short_description: string;
          description: string;
          used_parts?: string[];
          traditional_uses?: string[];
          preparation?: string[];
          care_instructions?: string[];
          warnings?: string[];
          image_path?: string | null;
          location_status?: string | null;
          source_notes?: string | null;
          validator_id?: string | null;
          validator_name?: string | null;
          validation_status?: ValidationStatus;
          content_status?: ContentStatus;
          featured?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plant_code?: string | null;
          slug?: string;
          local_name?: string;
          scientific_name?: string | null;
          other_names?: string[];
          category?: PlantCategory;
          short_description?: string;
          description?: string;
          used_parts?: string[];
          traditional_uses?: string[];
          preparation?: string[];
          care_instructions?: string[];
          warnings?: string[];
          image_path?: string | null;
          location_status?: string | null;
          source_notes?: string | null;
          validator_id?: string | null;
          validator_name?: string | null;
          validation_status?: ValidationStatus;
          content_status?: ContentStatus;
          featured?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plants_validator_id_fkey";
            columns: ["validator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plants_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plants_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      health_zones: {
        Row: {
          id: string;
          zone_code: string;
          slug: string;
          program_name: string;
          street_name: string;
          zone_name: string;
          block_ranges: string[];
          health_topic: string;
          sign_text: string | null;
          short_description: string;
          overview: string;
          educational_points: string[];
          healthy_habits: string[];
          important_notes: string[];
          source_notes: string[];
          image_path: string | null;
          location_notes: string | null;
          validator_name: string | null;
          validator_id: string | null;
          validation_status: ValidationStatus;
          content_status: ContentStatus;
          featured: boolean;
          published_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          zone_code: string;
          slug: string;
          program_name?: string;
          street_name: string;
          zone_name: string;
          block_ranges?: string[];
          health_topic: string;
          sign_text?: string | null;
          short_description: string;
          overview: string;
          educational_points?: string[];
          healthy_habits?: string[];
          important_notes?: string[];
          source_notes?: string[];
          image_path?: string | null;
          location_notes?: string | null;
          validator_name?: string | null;
          validator_id?: string | null;
          validation_status?: ValidationStatus;
          content_status?: ContentStatus;
          featured?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          zone_code?: string;
          slug?: string;
          program_name?: string;
          street_name?: string;
          zone_name?: string;
          block_ranges?: string[];
          health_topic?: string;
          sign_text?: string | null;
          short_description?: string;
          overview?: string;
          educational_points?: string[];
          healthy_habits?: string[];
          important_notes?: string[];
          source_notes?: string[];
          image_path?: string | null;
          location_notes?: string | null;
          validator_name?: string | null;
          validator_id?: string | null;
          validation_status?: ValidationStatus;
          content_status?: ContentStatus;
          featured?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "health_zones_validator_id_fkey";
            columns: ["validator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "health_zones_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "health_zones_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: AppRole | null;
      };
    };
    Enums: {
      app_role: AppRole;
      content_status: ContentStatus;
      validation_status: ValidationStatus;
      plant_category: PlantCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};
