export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      mapadata_billing_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          external_id: string | null
          external_reference: string | null
          id: string
          payload: Json
          processed: boolean
          provider: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          external_id?: string | null
          external_reference?: string | null
          id?: string
          payload?: Json
          processed?: boolean
          provider?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          external_id?: string | null
          external_reference?: string | null
          id?: string
          payload?: Json
          processed?: boolean
          provider?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mapadata_comuna_geos: {
        Row: {
          center_lat: number
          center_lng: number
          created_at: string
          display_name: string
          grid_step_meters: number
          id: string
          is_active: boolean
          radius_meters: number
          region: string
          region_code: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          center_lat: number
          center_lng: number
          created_at?: string
          display_name: string
          grid_step_meters?: number
          id?: string
          is_active?: boolean
          radius_meters?: number
          region: string
          region_code?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          center_lat?: number
          center_lng?: number
          created_at?: string
          display_name?: string
          grid_step_meters?: number
          id?: string
          is_active?: boolean
          radius_meters?: number
          region?: string
          region_code?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      mapadata_entitlements: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          leads_available: number
          leads_consumed: number
          metadata: Json
          mp_external_reference: string | null
          mp_payment_id: string | null
          plan_id: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          leads_available?: number
          leads_consumed?: number
          metadata?: Json
          mp_external_reference?: string | null
          mp_payment_id?: string | null
          plan_id: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          leads_available?: number
          leads_consumed?: number
          metadata?: Json
          mp_external_reference?: string | null
          mp_payment_id?: string | null
          plan_id?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mapadata_exports: {
        Row: {
          bytes: number | null
          created_at: string
          error_message: string | null
          format: string
          id: string
          row_count: number
          run_id: string | null
          status: string
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bytes?: number | null
          created_at?: string
          error_message?: string | null
          format: string
          id?: string
          row_count?: number
          run_id?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bytes?: number | null
          created_at?: string
          error_message?: string | null
          format?: string
          id?: string
          row_count?: number
          run_id?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mapadata_exports_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "mapadata_search_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      mapadata_industry_keywords: {
        Row: {
          created_at: string
          display_name: string
          google_places_types: string[]
          id: string
          is_active: boolean
          keywords: string[]
          related_slugs: string[]
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          google_places_types?: string[]
          id?: string
          is_active?: boolean
          keywords?: string[]
          related_slugs?: string[]
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          google_places_types?: string[]
          id?: string
          is_active?: boolean
          keywords?: string[]
          related_slugs?: string[]
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      mapadata_leads: {
        Row: {
          address: string | null
          comuna: string | null
          comuna_slug: string | null
          country: string
          created_at: string
          email: string | null
          enrichment: Json
          id: string
          industry_label: string | null
          industry_slug: string | null
          lat: number | null
          lng: number | null
          name: string
          name_normalized: string
          owner_user_id: string
          phone: string | null
          phone_e164: string | null
          place_id: string | null
          quality_score: number
          rating: number | null
          rating_count: number | null
          raw: Json
          region: string | null
          source: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          comuna?: string | null
          comuna_slug?: string | null
          country?: string
          created_at?: string
          email?: string | null
          enrichment?: Json
          id?: string
          industry_label?: string | null
          industry_slug?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          name_normalized: string
          owner_user_id: string
          phone?: string | null
          phone_e164?: string | null
          place_id?: string | null
          quality_score?: number
          rating?: number | null
          rating_count?: number | null
          raw?: Json
          region?: string | null
          source?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          comuna?: string | null
          comuna_slug?: string | null
          country?: string
          created_at?: string
          email?: string | null
          enrichment?: Json
          id?: string
          industry_label?: string | null
          industry_slug?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          name_normalized?: string
          owner_user_id?: string
          phone?: string | null
          phone_e164?: string | null
          place_id?: string | null
          quality_score?: number
          rating?: number | null
          rating_count?: number | null
          raw?: Json
          region?: string | null
          source?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      mapadata_run_leads: {
        Row: {
          created_at: string
          id: string
          is_new_for_user: boolean
          lead_id: string
          position: number | null
          run_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_new_for_user?: boolean
          lead_id: string
          position?: number | null
          run_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_new_for_user?: boolean
          lead_id?: string
          position?: number | null
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mapadata_run_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "mapadata_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapadata_run_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "mapadata_v_ferreterias_valparaiso_export"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapadata_run_leads_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "mapadata_search_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      mapadata_search_queries: {
        Row: {
          comuna_slug: string
          created_at: string
          extra_keywords: string[]
          filters: Json
          id: string
          industry_slug: string
          name: string | null
          region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comuna_slug: string
          created_at?: string
          extra_keywords?: string[]
          filters?: Json
          id?: string
          industry_slug: string
          name?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comuna_slug?: string
          created_at?: string
          extra_keywords?: string[]
          filters?: Json
          id?: string
          industry_slug?: string
          name?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mapadata_search_runs: {
        Row: {
          comuna_slug: string
          cost_usd: number
          created_at: string
          error_message: string | null
          formats: string[]
          id: string
          industry_slug: string
          leads_found: number
          leads_unique: number
          params: Json
          progress_pct: number
          query_id: string | null
          region: string | null
          requested_limit: number
          status: string
          updated_at: string
          user_id: string
          worker_finished_at: string | null
          worker_id: string | null
          worker_started_at: string | null
        }
        Insert: {
          comuna_slug: string
          cost_usd?: number
          created_at?: string
          error_message?: string | null
          formats?: string[]
          id?: string
          industry_slug: string
          leads_found?: number
          leads_unique?: number
          params?: Json
          progress_pct?: number
          query_id?: string | null
          region?: string | null
          requested_limit: number
          status?: string
          updated_at?: string
          user_id: string
          worker_finished_at?: string | null
          worker_id?: string | null
          worker_started_at?: string | null
        }
        Update: {
          comuna_slug?: string
          cost_usd?: number
          created_at?: string
          error_message?: string | null
          formats?: string[]
          id?: string
          industry_slug?: string
          leads_found?: number
          leads_unique?: number
          params?: Json
          progress_pct?: number
          query_id?: string | null
          region?: string | null
          requested_limit?: number
          status?: string
          updated_at?: string
          user_id?: string
          worker_finished_at?: string | null
          worker_id?: string | null
          worker_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mapadata_search_runs_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "mapadata_search_queries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mapadata_v_ferreterias_valparaiso_export: {
        Row: {
          comuna: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          id: string | null
          name: string | null
          owner_user_id: string | null
          quality_score: number | null
          rating: number | null
          region: string | null
          resenas: number | null
          sitio_web: string | null
          telefono: string | null
        }
        Insert: {
          comuna?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          owner_user_id?: string | null
          quality_score?: number | null
          rating?: number | null
          region?: string | null
          resenas?: number | null
          sitio_web?: string | null
          telefono?: string | null
        }
        Update: {
          comuna?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          owner_user_id?: string | null
          quality_score?: number | null
          rating?: number | null
          region?: string | null
          resenas?: number | null
          sitio_web?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      mapadata_consume_credits: {
        Args: { _amount: number; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
