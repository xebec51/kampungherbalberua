/**
 * Hand-written to match supabase/migrations/*.sql.
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

export type IdentificationStatus =
  | "unresolved"
  | "candidate"
  | "confirmed"
  | "disputed";

export type MediaSourceType =
  | "community_original"
  | "kkn_documentation"
  | "resident_submission"
  | "wikimedia_commons"
  | "government_open_data"
  | "external_licensed"
  | "public_domain"
  | "commissioned";

export type MediaRightsStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_clarification";

export type MediaPrivacyStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected";

export type MediaImageType =
  | "cover"
  | "whole_plant"
  | "leaf"
  | "flower"
  | "fruit"
  | "seed"
  | "stem"
  | "root"
  | "rhizome"
  | "recipe"
  | "product"
  | "documentation"
  | "portrait"
  | "map"
  | "illustration"
  | "hero";

export type ContentMediaType =
  | "recipe"
  | "product"
  | "activity"
  | "program"
  | "team"
  | "site"
  | "map";

export type PlantNameType =
  | "preferred_local"
  | "alternate_local"
  | "scientific"
  | "poster_raw"
  | "poster_misspelling"
  | "trade_name"
  | "unresolved_common_name";

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
          canonical_local_name: string | null;
          slug: string;
          local_name: string;
          scientific_name: string | null;
          scientific_authority: string | null;
          family: string | null;
          taxonomy_source: string | null;
          taxonomy_external_id: string | null;
          identification_status: IdentificationStatus;
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
          canonical_local_name?: string | null;
          slug: string;
          local_name: string;
          scientific_name?: string | null;
          scientific_authority?: string | null;
          family?: string | null;
          taxonomy_source?: string | null;
          taxonomy_external_id?: string | null;
          identification_status?: IdentificationStatus;
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
          canonical_local_name?: string | null;
          slug?: string;
          local_name?: string;
          scientific_name?: string | null;
          scientific_authority?: string | null;
          family?: string | null;
          taxonomy_source?: string | null;
          taxonomy_external_id?: string | null;
          identification_status?: IdentificationStatus;
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
      media_assets: {
        Row: {
          id: string;
          asset_code: string;
          title: string;
          alt_text: string;
          caption: string | null;
          media_kind: "image";
          image_type: MediaImageType | null;
          original_bucket: string | null;
          original_path: string | null;
          public_bucket: string | null;
          public_path: string | null;
          mime_type: string;
          width: number | null;
          height: number | null;
          file_size_bytes: number | null;
          checksum_sha256: string;
          source_type: MediaSourceType;
          source_page_url: string | null;
          source_file_url: string | null;
          creator_name: string | null;
          license_code: string | null;
          license_url: string | null;
          attribution_text: string | null;
          changes_made: string | null;
          accessed_at: string | null;
          rights_status: MediaRightsStatus;
          privacy_status: MediaPrivacyStatus;
          content_status: ContentStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_code: string;
          title: string;
          alt_text: string;
          caption?: string | null;
          media_kind?: "image";
          image_type?: MediaImageType | null;
          original_bucket?: string | null;
          original_path?: string | null;
          public_bucket?: string | null;
          public_path?: string | null;
          mime_type: string;
          width?: number | null;
          height?: number | null;
          file_size_bytes?: number | null;
          checksum_sha256: string;
          source_type: MediaSourceType;
          source_page_url?: string | null;
          source_file_url?: string | null;
          creator_name?: string | null;
          license_code?: string | null;
          license_url?: string | null;
          attribution_text?: string | null;
          changes_made?: string | null;
          accessed_at?: string | null;
          rights_status?: MediaRightsStatus;
          privacy_status?: MediaPrivacyStatus;
          content_status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_code?: string;
          title?: string;
          alt_text?: string;
          caption?: string | null;
          media_kind?: "image";
          image_type?: MediaImageType | null;
          original_bucket?: string | null;
          original_path?: string | null;
          public_bucket?: string | null;
          public_path?: string | null;
          mime_type?: string;
          width?: number | null;
          height?: number | null;
          file_size_bytes?: number | null;
          checksum_sha256?: string;
          source_type?: MediaSourceType;
          source_page_url?: string | null;
          source_file_url?: string | null;
          creator_name?: string | null;
          license_code?: string | null;
          license_url?: string | null;
          attribution_text?: string | null;
          changes_made?: string | null;
          accessed_at?: string | null;
          rights_status?: MediaRightsStatus;
          privacy_status?: MediaPrivacyStatus;
          content_status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      plant_media: {
        Row: {
          plant_id: string;
          media_id: string;
          role: string;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          plant_id: string;
          media_id: string;
          role: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          plant_id?: string;
          media_id?: string;
          role?: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_media_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plant_media_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      health_zone_media: {
        Row: {
          health_zone_id: string;
          media_id: string;
          role: string;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          health_zone_id: string;
          media_id: string;
          role: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          health_zone_id?: string;
          media_id?: string;
          role?: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "health_zone_media_health_zone_id_fkey";
            columns: ["health_zone_id"];
            isOneToOne: false;
            referencedRelation: "health_zones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "health_zone_media_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      content_media_slots: {
        Row: {
          id: string;
          content_type: ContentMediaType;
          content_key: string;
          media_id: string;
          role: string;
          sort_order: number;
          is_primary: boolean;
          label_as_illustration: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_type: ContentMediaType;
          content_key: string;
          media_id: string;
          role: string;
          sort_order?: number;
          is_primary?: boolean;
          label_as_illustration?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_type?: ContentMediaType;
          content_key?: string;
          media_id?: string;
          role?: string;
          sort_order?: number;
          is_primary?: boolean;
          label_as_illustration?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_media_slots_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      plant_source_label_media: {
        Row: {
          source_id: string;
          normalized_name: string;
          raw_name: string;
          slug: string;
          media_id: string;
          role: string;
          is_primary: boolean;
          label_as_illustration: boolean;
          created_at: string;
        };
        Insert: {
          source_id: string;
          normalized_name: string;
          raw_name: string;
          slug: string;
          media_id: string;
          role?: string;
          is_primary?: boolean;
          label_as_illustration?: boolean;
          created_at?: string;
        };
        Update: {
          source_id?: string;
          normalized_name?: string;
          raw_name?: string;
          slug?: string;
          media_id?: string;
          role?: string;
          is_primary?: boolean;
          label_as_illustration?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_source_label_media_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "plant_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plant_source_label_media_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      plant_sources: {
        Row: {
          id: string;
          source_code: string;
          title: string;
          source_type: string;
          description: string | null;
          file_reference: string | null;
          claimed_total: number | null;
          observed_entry_total: number | null;
          numbering_notes: string | null;
          content_status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_code: string;
          title: string;
          source_type: string;
          description?: string | null;
          file_reference?: string | null;
          claimed_total?: number | null;
          observed_entry_total?: number | null;
          numbering_notes?: string | null;
          content_status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_code?: string;
          title?: string;
          source_type?: string;
          description?: string | null;
          file_reference?: string | null;
          claimed_total?: number | null;
          observed_entry_total?: number | null;
          numbering_notes?: string | null;
          content_status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plant_collections: {
        Row: {
          id: string;
          source_id: string;
          collection_number: number;
          source_title: string;
          public_title: string;
          slug: string;
          display_order: number;
          description: string | null;
          validation_status: ValidationStatus;
          content_status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          collection_number: number;
          source_title: string;
          public_title: string;
          slug: string;
          display_order: number;
          description?: string | null;
          validation_status?: ValidationStatus;
          content_status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          collection_number?: number;
          source_title?: string;
          public_title?: string;
          slug?: string;
          display_order?: number;
          description?: string | null;
          validation_status?: ValidationStatus;
          content_status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_collections_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "plant_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      plant_source_entries: {
        Row: {
          id: string;
          source_id: string;
          collection_id: string;
          poster_number: number;
          raw_plant_name: string;
          normalized_candidate_name: string | null;
          plant_id: string | null;
          transcription_status: string;
          mapping_status: string;
          transcription_notes: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          collection_id: string;
          poster_number: number;
          raw_plant_name: string;
          normalized_candidate_name?: string | null;
          plant_id?: string | null;
          transcription_status?: string;
          mapping_status?: string;
          transcription_notes?: string | null;
          display_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          collection_id?: string;
          poster_number?: number;
          raw_plant_name?: string;
          normalized_candidate_name?: string | null;
          plant_id?: string | null;
          transcription_status?: string;
          mapping_status?: string;
          transcription_notes?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_source_entries_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "plant_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plant_source_entries_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "plant_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plant_source_entries_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      plant_names: {
        Row: {
          id: string;
          plant_id: string | null;
          name: string;
          normalized_name: string;
          name_type: PlantNameType;
          language_code: string | null;
          source_id: string | null;
          is_preferred: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plant_id?: string | null;
          name: string;
          normalized_name: string;
          name_type: PlantNameType;
          language_code?: string | null;
          source_id?: string | null;
          is_preferred?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plant_id?: string | null;
          name?: string;
          normalized_name?: string;
          name_type?: PlantNameType;
          language_code?: string | null;
          source_id?: string | null;
          is_preferred?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_names_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plant_names_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "plant_sources";
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
