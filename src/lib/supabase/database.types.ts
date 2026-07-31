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

export type MediaQualityEntityType =
  | "plant"
  | "poster_plant"
  | "health_zone"
  | "recipe"
  | "product"
  | "activity"
  | "program"
  | "team"
  | "site"
  | "map";

export type MediaRelevanceStatus =
  | "exact"
  | "common_name_match"
  | "corrected_spelling_match"
  | "material_match"
  | "illustration_reference"
  | "generic_fallback"
  | "irrelevant"
  | "needs_review";

export type MediaQualityStatus =
  | "approved"
  | "acceptable"
  | "low_resolution"
  | "poor_crop"
  | "misleading"
  | "broken"
  | "needs_review";

export type MediaDuplicateStatus =
  | "unique"
  | "intentionally_reused"
  | "generic_reuse"
  | "excessive_reuse";

export type MediaAttachmentHistoryAction =
  | "attach"
  | "replace_primary"
  | "mark_non_primary"
  | "restore"
  | "classify";

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
          validation_checked_at: string | null;
          validation_notes: string | null;
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
          validation_checked_at?: string | null;
          validation_notes?: string | null;
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
          validation_checked_at?: string | null;
          validation_notes?: string | null;
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
          qr_key: string;
          zone_code: string;
          display_order: number | null;
          slug: string;
          program_name: string;
          street_name: string | null;
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
          validation_checked_at: string | null;
          validation_notes: string | null;
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
          qr_key?: string;
          zone_code: string;
          display_order?: number | null;
          slug: string;
          program_name?: string;
          street_name?: string | null;
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
          validation_checked_at?: string | null;
          validation_notes?: string | null;
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
          qr_key?: string;
          zone_code?: string;
          display_order?: number | null;
          slug?: string;
          program_name?: string;
          street_name?: string | null;
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
          validation_checked_at?: string | null;
          validation_notes?: string | null;
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
      streets: {
        Row: {
          id: string;
          qr_key: string;
          slug: string;
          street_name: string;
          description: string | null;
          source_notes: string[];
          validation_status: ValidationStatus;
          content_status: ContentStatus;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          qr_key?: string;
          slug: string;
          street_name: string;
          description?: string | null;
          source_notes?: string[];
          validation_status?: ValidationStatus;
          content_status?: ContentStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          qr_key?: string;
          slug?: string;
          street_name?: string;
          description?: string | null;
          source_notes?: string[];
          validation_status?: ValidationStatus;
          content_status?: ContentStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "streets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "streets_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      health_zone_streets: {
        Row: {
          health_zone_id: string;
          street_id: string;
          sort_order: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          health_zone_id: string;
          street_id: string;
          sort_order?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          health_zone_id?: string;
          street_id?: string;
          sort_order?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "health_zone_streets_health_zone_id_fkey";
            columns: ["health_zone_id"];
            isOneToOne: false;
            referencedRelation: "health_zones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "health_zone_streets_street_id_fkey";
            columns: ["street_id"];
            isOneToOne: false;
            referencedRelation: "streets";
            referencedColumns: ["id"];
          },
        ];
      };
      street_plant_entries: {
        Row: {
          id: string;
          street_id: string;
          plant_id: string | null;
          raw_plant_name: string;
          normalized_name: string;
          sort_order: number;
          match_status:
            | "exact"
            | "alias"
            | "scientific"
            | "manual"
            | "ambiguous"
            | "unresolved";
          source_media_id: string | null;
          source_photo_path: string | null;
          notes: string | null;
          content_status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          street_id: string;
          plant_id?: string | null;
          raw_plant_name: string;
          normalized_name: string;
          sort_order: number;
          match_status?:
            | "exact"
            | "alias"
            | "scientific"
            | "manual"
            | "ambiguous"
            | "unresolved";
          source_media_id?: string | null;
          source_photo_path?: string | null;
          notes?: string | null;
          content_status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          street_id?: string;
          plant_id?: string | null;
          raw_plant_name?: string;
          normalized_name?: string;
          sort_order?: number;
          match_status?:
            | "exact"
            | "alias"
            | "scientific"
            | "manual"
            | "ambiguous"
            | "unresolved";
          source_media_id?: string | null;
          source_photo_path?: string | null;
          notes?: string | null;
          content_status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "street_plant_entries_street_id_fkey";
            columns: ["street_id"];
            isOneToOne: false;
            referencedRelation: "streets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "street_plant_entries_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "street_plant_entries_source_media_id_fkey";
            columns: ["source_media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      street_media: {
        Row: {
          street_id: string;
          media_id: string;
          role: string;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          street_id: string;
          media_id: string;
          role: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          street_id?: string;
          media_id?: string;
          role?: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "street_media_street_id_fkey";
            columns: ["street_id"];
            isOneToOne: false;
            referencedRelation: "streets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "street_media_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
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
      media_quality_reviews: {
        Row: {
          id: string;
          media_id: string;
          entity_type: MediaQualityEntityType;
          entity_key: string;
          relevance_status: MediaRelevanceStatus;
          quality_status: MediaQualityStatus;
          duplicate_status: MediaDuplicateStatus;
          review_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          media_id: string;
          entity_type: MediaQualityEntityType;
          entity_key: string;
          relevance_status: MediaRelevanceStatus;
          quality_status: MediaQualityStatus;
          duplicate_status?: MediaDuplicateStatus;
          review_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          entity_type?: MediaQualityEntityType;
          entity_key?: string;
          relevance_status?: MediaRelevanceStatus;
          quality_status?: MediaQualityStatus;
          duplicate_status?: MediaDuplicateStatus;
          review_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_quality_reviews_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_quality_reviews_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      media_attachment_history: {
        Row: {
          id: string;
          entity_type: MediaQualityEntityType;
          entity_key: string;
          old_media_id: string | null;
          new_media_id: string;
          action: MediaAttachmentHistoryAction;
          changed_by: string | null;
          change_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: MediaQualityEntityType;
          entity_key: string;
          old_media_id?: string | null;
          new_media_id: string;
          action: MediaAttachmentHistoryAction;
          changed_by?: string | null;
          change_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: MediaQualityEntityType;
          entity_key?: string;
          old_media_id?: string | null;
          new_media_id?: string;
          action?: MediaAttachmentHistoryAction;
          changed_by?: string | null;
          change_reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_attachment_history_old_media_id_fkey";
            columns: ["old_media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_attachment_history_new_media_id_fkey";
            columns: ["new_media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_attachment_history_changed_by_fkey";
            columns: ["changed_by"];
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
      herbacode_plant_zone_entries: {
        Row: {
          id: string;
          source_id: string;
          health_zone_id: string;
          plant_id: string;
          zone_code: string;
          zone_slug: string;
          zone_title: string;
          entry_order: number;
          raw_zone_title: string;
          raw_entry_title: string;
          local_name: string;
          scientific_name: string | null;
          active_compounds: string[];
          benefits: string[];
          used_parts: string[];
          cultivation_techniques: string[];
          warnings: string[];
          preparation_methods: string[];
          source_document_name: string;
          title_correction_notes: string[];
          content_status: ContentStatus;
          validation_status: ValidationStatus;
          validator_id: string | null;
          validator_name: string | null;
          validated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          health_zone_id: string;
          plant_id: string;
          zone_code: string;
          zone_slug: string;
          zone_title: string;
          entry_order: number;
          raw_zone_title: string;
          raw_entry_title: string;
          local_name: string;
          scientific_name?: string | null;
          active_compounds?: string[];
          benefits?: string[];
          used_parts?: string[];
          cultivation_techniques?: string[];
          warnings?: string[];
          preparation_methods?: string[];
          source_document_name: string;
          title_correction_notes?: string[];
          content_status?: ContentStatus;
          validation_status?: ValidationStatus;
          validator_id?: string | null;
          validator_name?: string | null;
          validated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          health_zone_id?: string;
          plant_id?: string;
          zone_code?: string;
          zone_slug?: string;
          zone_title?: string;
          entry_order?: number;
          raw_zone_title?: string;
          raw_entry_title?: string;
          local_name?: string;
          scientific_name?: string | null;
          active_compounds?: string[];
          benefits?: string[];
          used_parts?: string[];
          cultivation_techniques?: string[];
          warnings?: string[];
          preparation_methods?: string[];
          source_document_name?: string;
          title_correction_notes?: string[];
          content_status?: ContentStatus;
          validation_status?: ValidationStatus;
          validator_id?: string | null;
          validator_name?: string | null;
          validated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "herbacode_plant_zone_entries_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "plant_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "herbacode_plant_zone_entries_health_zone_id_fkey";
            columns: ["health_zone_id"];
            isOneToOne: false;
            referencedRelation: "health_zones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "herbacode_plant_zone_entries_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      herbacode_entry_history: {
        Row: {
          id: string;
          entry_id: string;
          action: string;
          change_summary: Json;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          action: string;
          change_summary?: Json;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          action?: string;
          change_summary?: Json;
          changed_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "herbacode_entry_history_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "herbacode_plant_zone_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "herbacode_entry_history_changed_by_fkey";
            columns: ["changed_by"];
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
