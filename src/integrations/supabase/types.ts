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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      development_arb_packages: {
        Row: {
          created_at: string
          development_id: string
          exterior_package_id: string
        }
        Insert: {
          created_at?: string
          development_id: string
          exterior_package_id: string
        }
        Update: {
          created_at?: string
          development_id?: string
          exterior_package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_arb_packages_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_arb_packages_exterior_package_id_fkey"
            columns: ["exterior_package_id"]
            isOneToOne: false
            referencedRelation: "exterior_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      development_conforming_models: {
        Row: {
          created_at: string
          development_id: string
          model_id: string
        }
        Insert: {
          created_at?: string
          development_id: string
          model_id: string
        }
        Update: {
          created_at?: string
          development_id?: string
          model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_conforming_models_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_conforming_models_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      developments: {
        Row: {
          arb_guidelines_url: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          pricing_zone_id: string | null
          site_plan_image_url: string | null
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["development_status"]
          updated_at: string
        }
        Insert: {
          arb_guidelines_url?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          pricing_zone_id?: string | null
          site_plan_image_url?: string | null
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["development_status"]
          updated_at?: string
        }
        Update: {
          arb_guidelines_url?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pricing_zone_id?: string | null
          site_plan_image_url?: string | null
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["development_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "developments_pricing_zone_id_fkey"
            columns: ["pricing_zone_id"]
            isOneToOne: false
            referencedRelation: "pricing_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      exterior_packages: {
        Row: {
          accent_color_hex: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          roof_color_hex: string | null
          siding_color_hex: string | null
          slug: string
          trim_color_hex: string | null
          updated_at: string
          upgrade_price: number
        }
        Insert: {
          accent_color_hex?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          roof_color_hex?: string | null
          siding_color_hex?: string | null
          slug: string
          trim_color_hex?: string | null
          updated_at?: string
          upgrade_price?: number
        }
        Update: {
          accent_color_hex?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          roof_color_hex?: string | null
          siding_color_hex?: string | null
          slug?: string
          trim_color_hex?: string | null
          updated_at?: string
          upgrade_price?: number
        }
        Relationships: []
      }
      financing_applications: {
        Row: {
          annual_income_range: Database["public"]["Enums"]["income_range"]
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          credit_score_range: Database["public"]["Enums"]["credit_score_range"]
          down_payment_amount: number
          down_payment_percent: number
          employment_status: Database["public"]["Enums"]["employment_status"]
          id: string
          intended_use: Database["public"]["Enums"]["intended_use"]
          interest_rate: number
          loan_amount_requested: number
          loan_term_years: number
          monthly_payment_estimate: number | null
          notes: string | null
          pre_qualification_status: Database["public"]["Enums"]["prequal_status"]
          pre_qualified_amount: number | null
          purchase_price: number
          purchase_timeframe: Database["public"]["Enums"]["purchase_timeframe"]
          quote_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          annual_income_range?: Database["public"]["Enums"]["income_range"]
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          credit_score_range?: Database["public"]["Enums"]["credit_score_range"]
          down_payment_amount?: number
          down_payment_percent?: number
          employment_status?: Database["public"]["Enums"]["employment_status"]
          id?: string
          intended_use?: Database["public"]["Enums"]["intended_use"]
          interest_rate?: number
          loan_amount_requested?: number
          loan_term_years?: number
          monthly_payment_estimate?: number | null
          notes?: string | null
          pre_qualification_status?: Database["public"]["Enums"]["prequal_status"]
          pre_qualified_amount?: number | null
          purchase_price: number
          purchase_timeframe?: Database["public"]["Enums"]["purchase_timeframe"]
          quote_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          annual_income_range?: Database["public"]["Enums"]["income_range"]
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          credit_score_range?: Database["public"]["Enums"]["credit_score_range"]
          down_payment_amount?: number
          down_payment_percent?: number
          employment_status?: Database["public"]["Enums"]["employment_status"]
          id?: string
          intended_use?: Database["public"]["Enums"]["intended_use"]
          interest_rate?: number
          loan_amount_requested?: number
          loan_term_years?: number
          monthly_payment_estimate?: number | null
          notes?: string | null
          pre_qualification_status?: Database["public"]["Enums"]["prequal_status"]
          pre_qualified_amount?: number | null
          purchase_price?: number
          purchase_timeframe?: Database["public"]["Enums"]["purchase_timeframe"]
          quote_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financing_applications_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_door_options: {
        Row: {
          color_hex: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          price: number
          slug: string
          style: Database["public"]["Enums"]["garage_style"]
          updated_at: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
          slug: string
          style?: Database["public"]["Enums"]["garage_style"]
          updated_at?: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          style?: Database["public"]["Enums"]["garage_style"]
          updated_at?: string
        }
        Relationships: []
      }
      lots: {
        Row: {
          acreage: number | null
          created_at: string
          development_id: string
          id: string
          lot_number: string
          net_acreage: number | null
          notes: string | null
          polygon_coordinates: Json | null
          premium: number
          restrictions: Json | null
          status: Database["public"]["Enums"]["lot_status"]
          updated_at: string
        }
        Insert: {
          acreage?: number | null
          created_at?: string
          development_id: string
          id?: string
          lot_number: string
          net_acreage?: number | null
          notes?: string | null
          polygon_coordinates?: Json | null
          premium?: number
          restrictions?: Json | null
          status?: Database["public"]["Enums"]["lot_status"]
          updated_at?: string
        }
        Update: {
          acreage?: number | null
          created_at?: string
          development_id?: string
          id?: string
          lot_number?: string
          net_acreage?: number | null
          notes?: string | null
          polygon_coordinates?: Json | null
          premium?: number
          restrictions?: Json | null
          status?: Database["public"]["Enums"]["lot_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lots_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
        ]
      }
      model_pricing: {
        Row: {
          base_cost: number | null
          base_home_price: number
          build_type: Database["public"]["Enums"]["build_type"]
          created_at: string
          created_by: string | null
          effective_from: string
          foundation_type: Database["public"]["Enums"]["foundation_type"]
          freight_allowance: number
          freight_pending: boolean
          id: string
          is_current: boolean
          model_id: string
          options_delta: number | null
          pricing_source: string | null
          quote_date: string | null
          quote_number: string | null
          shipping_charge: number | null
        }
        Insert: {
          base_cost?: number | null
          base_home_price: number
          build_type: Database["public"]["Enums"]["build_type"]
          created_at?: string
          created_by?: string | null
          effective_from?: string
          foundation_type: Database["public"]["Enums"]["foundation_type"]
          freight_allowance?: number
          freight_pending?: boolean
          id?: string
          is_current?: boolean
          model_id: string
          options_delta?: number | null
          pricing_source?: string | null
          quote_date?: string | null
          quote_number?: string | null
          shipping_charge?: number | null
        }
        Update: {
          base_cost?: number | null
          base_home_price?: number
          build_type?: Database["public"]["Enums"]["build_type"]
          created_at?: string
          created_by?: string | null
          effective_from?: string
          foundation_type?: Database["public"]["Enums"]["foundation_type"]
          freight_allowance?: number
          freight_pending?: boolean
          id?: string
          is_current?: boolean
          model_id?: string
          options_delta?: number | null
          pricing_source?: string | null
          quote_date?: string | null
          quote_number?: string | null
          shipping_charge?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "model_pricing_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          badge: string | null
          baths: number
          beds: number
          created_at: string
          description: string | null
          display_order: number
          floorplan_image_url: string | null
          floorplan_pdf_url: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean
          length: number | null
          name: string
          slug: string
          sqft: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          baths: number
          beds: number
          created_at?: string
          description?: string | null
          display_order?: number
          floorplan_image_url?: string | null
          floorplan_pdf_url?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          length?: number | null
          name: string
          slug: string
          sqft: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          baths?: number
          beds?: number
          created_at?: string
          description?: string | null
          display_order?: number
          floorplan_image_url?: string | null
          floorplan_pdf_url?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          length?: number | null
          name?: string
          slug?: string
          sqft?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pricing_configs: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          effective_at: string | null
          id: string
          label: string | null
          status: string
        }
        Insert: {
          config: Json
          created_at?: string
          created_by?: string | null
          effective_at?: string | null
          id?: string
          label?: string | null
          status: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          effective_at?: string | null
          id?: string
          label?: string | null
          status?: string
        }
        Relationships: []
      }
      pricing_markups: {
        Row: {
          created_at: string
          created_by: string | null
          dealer_markup_pct: number
          developer_markup_pct: number
          effective_from: string
          id: string
          installer_markup_pct: number
          is_default: boolean
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dealer_markup_pct?: number
          developer_markup_pct?: number
          effective_from?: string
          id?: string
          installer_markup_pct?: number
          is_default?: boolean
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dealer_markup_pct?: number
          developer_markup_pct?: number
          effective_from?: string
          id?: string
          installer_markup_pct?: number
          is_default?: boolean
          name?: string
        }
        Relationships: []
      }
      pricing_zones: {
        Row: {
          baseline_total: number
          contingency_buffer: number
          crane_cost: number
          created_at: string
          home_set_cost: number
          id: string
          name: string
          on_site_portion: number
          permits_soft_costs: number
          slug: string
          updated_at: string
          utility_authority_fees: number
        }
        Insert: {
          baseline_total?: number
          contingency_buffer?: number
          crane_cost?: number
          created_at?: string
          home_set_cost?: number
          id?: string
          name: string
          on_site_portion?: number
          permits_soft_costs?: number
          slug: string
          updated_at?: string
          utility_authority_fees?: number
        }
        Update: {
          baseline_total?: number
          contingency_buffer?: number
          crane_cost?: number
          created_at?: string
          home_set_cost?: number
          id?: string
          name?: string
          on_site_portion?: number
          permits_soft_costs?: number
          slug?: string
          updated_at?: string
          utility_authority_fees?: number
        }
        Relationships: []
      }
      quotes: {
        Row: {
          address: string | null
          build_type: Database["public"]["Enums"]["build_type"] | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          development_id: string | null
          exterior_package_id: string | null
          foundation_type: Database["public"]["Enums"]["foundation_type"] | null
          garage_door_id: string | null
          id: string
          include_permits_costs: boolean
          include_utility_fees: boolean
          lot_id: string | null
          model_id: string | null
          notes: string | null
          selected_options: string[] | null
          service_package: Database["public"]["Enums"]["service_package"]
          status: Database["public"]["Enums"]["quote_status"]
          total_estimate: number | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          build_type?: Database["public"]["Enums"]["build_type"] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          development_id?: string | null
          exterior_package_id?: string | null
          foundation_type?:
            | Database["public"]["Enums"]["foundation_type"]
            | null
          garage_door_id?: string | null
          id?: string
          include_permits_costs?: boolean
          include_utility_fees?: boolean
          lot_id?: string | null
          model_id?: string | null
          notes?: string | null
          selected_options?: string[] | null
          service_package?: Database["public"]["Enums"]["service_package"]
          status?: Database["public"]["Enums"]["quote_status"]
          total_estimate?: number | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          build_type?: Database["public"]["Enums"]["build_type"] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          development_id?: string | null
          exterior_package_id?: string | null
          foundation_type?:
            | Database["public"]["Enums"]["foundation_type"]
            | null
          garage_door_id?: string | null
          id?: string
          include_permits_costs?: boolean
          include_utility_fees?: boolean
          lot_id?: string | null
          model_id?: string | null
          notes?: string | null
          selected_options?: string[] | null
          service_package?: Database["public"]["Enums"]["service_package"]
          status?: Database["public"]["Enums"]["quote_status"]
          total_estimate?: number | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_exterior_package_id_fkey"
            columns: ["exterior_package_id"]
            isOneToOne: false
            referencedRelation: "exterior_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_garage_door_id_fkey"
            columns: ["garage_door_id"]
            isOneToOne: false
            referencedRelation: "garage_door_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      upgrade_options: {
        Row: {
          applies_to_build_types:
            | Database["public"]["Enums"]["build_type"][]
            | null
          applies_to_models: string[] | null
          base_price: number
          category: Database["public"]["Enums"]["upgrade_category"]
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          label: string
          slug: string
          updated_at: string
        }
        Insert: {
          applies_to_build_types?:
            | Database["public"]["Enums"]["build_type"][]
            | null
          applies_to_models?: string[] | null
          base_price?: number
          category: Database["public"]["Enums"]["upgrade_category"]
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          slug: string
          updated_at?: string
        }
        Update: {
          applies_to_build_types?:
            | Database["public"]["Enums"]["build_type"][]
            | null
          applies_to_models?: string[] | null
          base_price?: number
          category?: Database["public"]["Enums"]["upgrade_category"]
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_lot_data: {
        Args: never
        Returns: {
          acreage: number | null
          created_at: string
          development_id: string
          id: string
          lot_number: string
          net_acreage: number | null
          notes: string | null
          polygon_coordinates: Json | null
          premium: number
          restrictions: Json | null
          status: Database["public"]["Enums"]["lot_status"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "lots"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_model_pricing: {
        Args: never
        Returns: {
          base_home_price: number
          build_type: string
          effective_from: string
          foundation_type: string
          id: string
          is_current: boolean
          model_id: string
        }[]
      }
      get_public_pricing_zones: {
        Args: never
        Returns: {
          baseline_total: number
          id: string
          name: string
          slug: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_admin_or_builder: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "builder"
      build_type: "xmod" | "mod"
      credit_score_range:
        | "excellent_750"
        | "good_700"
        | "fair_650"
        | "below_650"
        | "unsure"
      development_status: "active" | "coming-soon" | "sold-out"
      employment_status: "employed" | "self_employed" | "retired" | "other"
      foundation_type: "slab" | "basement" | "crawl"
      garage_style: "traditional" | "carriage" | "modern" | "craftsman"
      income_range:
        | "under_50k"
        | "50k_75k"
        | "75k_100k"
        | "100k_150k"
        | "150k_plus"
      intended_use: "primary" | "second_home" | "investment"
      lot_status: "available" | "reserved" | "sold" | "pending"
      prequal_status: "pending" | "pre_qualified" | "needs_review" | "declined"
      purchase_timeframe:
        | "0_3_months"
        | "3_6_months"
        | "6_12_months"
        | "12_plus"
      quote_status: "draft" | "submitted" | "contacted" | "converted"
      service_package:
        | "delivered_installed"
        | "supply_only"
        | "community_all_in"
      upgrade_category:
        | "floor_plan"
        | "exterior"
        | "garage"
        | "foundation"
        | "heating"
        | "appliance"
        | "electrical"
        | "plumbing"
        | "bath"
        | "countertop"
        | "cabinet"
        | "interior"
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
    Enums: {
      app_role: ["admin", "builder"],
      build_type: ["xmod", "mod"],
      credit_score_range: [
        "excellent_750",
        "good_700",
        "fair_650",
        "below_650",
        "unsure",
      ],
      development_status: ["active", "coming-soon", "sold-out"],
      employment_status: ["employed", "self_employed", "retired", "other"],
      foundation_type: ["slab", "basement", "crawl"],
      garage_style: ["traditional", "carriage", "modern", "craftsman"],
      income_range: [
        "under_50k",
        "50k_75k",
        "75k_100k",
        "100k_150k",
        "150k_plus",
      ],
      intended_use: ["primary", "second_home", "investment"],
      lot_status: ["available", "reserved", "sold", "pending"],
      prequal_status: ["pending", "pre_qualified", "needs_review", "declined"],
      purchase_timeframe: [
        "0_3_months",
        "3_6_months",
        "6_12_months",
        "12_plus",
      ],
      quote_status: ["draft", "submitted", "contacted", "converted"],
      service_package: [
        "delivered_installed",
        "supply_only",
        "community_all_in",
      ],
      upgrade_category: [
        "floor_plan",
        "exterior",
        "garage",
        "foundation",
        "heating",
        "appliance",
        "electrical",
        "plumbing",
        "bath",
        "countertop",
        "cabinet",
        "interior",
      ],
    },
  },
} as const
