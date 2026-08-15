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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          starts_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          starts_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          starts_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      crypto_wallets: {
        Row: {
          asset: string
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_amount: number | null
          network: string
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          asset: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          network: string
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          asset?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          network?: string
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_id: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_id: string | null
          customer_name: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["payment_status"] | null
          order_id: string | null
          payment_id: string | null
          previous_status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["payment_status"] | null
          order_id?: string | null
          payment_id?: string | null
          previous_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["payment_status"] | null
          order_id?: string | null
          payment_id?: string | null
          previous_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_audit_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_audit_log_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          event_id: string
          id: string
          payload: Json
          payment_id: string | null
          processed_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
        }
        Insert: {
          event_id: string
          id?: string
          payload: Json
          payment_id?: string | null
          processed_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
        }
        Update: {
          event_id?: string
          id?: string
          payload?: Json
          payment_id?: string | null
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          error_message: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          network: string | null
          order_id: string
          paid_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_reference: string | null
          provider_transaction_id: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_hash: string | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          error_message?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          network?: string | null
          order_id: string
          paid_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_reference?: string | null
          provider_transaction_id?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          error_message?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          network?: string | null
          order_id?: string
          paid_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_reference?: string | null
          provider_transaction_id?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_licenses: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          created_at: string
          expires_at: string | null
          id: string
          license_key: string
          product_id: string
          status: Database["public"]["Enums"]["license_status"] | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          license_key: string
          product_id: string
          status?: Database["public"]["Enums"]["license_status"] | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          license_key?: string
          product_id?: string
          status?: Database["public"]["Enums"]["license_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "product_licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_main: boolean | null
          media_type: string
          product_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_main?: boolean | null
          media_type: string
          product_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_main?: boolean | null
          media_type?: string
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          compatibility: Json | null
          created_at: string
          currency: string | null
          delivery_instructions: string | null
          delivery_method: Database["public"]["Enums"]["delivery_method"] | null
          description: string | null
          device_limit: number | null
          features: Json | null
          full_description: string | null
          id: string
          image_url: string | null
          inventory_type: Database["public"]["Enums"]["inventory_type"] | null
          is_featured: boolean | null
          license_duration: number | null
          name: string
          price: number
          product_type: Database["public"]["Enums"]["product_type"] | null
          requirements: Json | null
          resale_auth_verified: boolean | null
          sale_price: number | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          short_description: string | null
          sku: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"] | null
          stock_quantity: number | null
          stock_status: string | null
          version: string | null
          whats_included: Json | null
        }
        Insert: {
          category_id?: string | null
          compatibility?: Json | null
          created_at?: string
          currency?: string | null
          delivery_instructions?: string | null
          delivery_method?:
            | Database["public"]["Enums"]["delivery_method"]
            | null
          description?: string | null
          device_limit?: number | null
          features?: Json | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          inventory_type?: Database["public"]["Enums"]["inventory_type"] | null
          is_featured?: boolean | null
          license_duration?: number | null
          name: string
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"] | null
          requirements?: Json | null
          resale_auth_verified?: boolean | null
          sale_price?: number | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"] | null
          stock_quantity?: number | null
          stock_status?: string | null
          version?: string | null
          whats_included?: Json | null
        }
        Update: {
          category_id?: string | null
          compatibility?: Json | null
          created_at?: string
          currency?: string | null
          delivery_instructions?: string | null
          delivery_method?:
            | Database["public"]["Enums"]["delivery_method"]
            | null
          description?: string | null
          device_limit?: number | null
          features?: Json | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          inventory_type?: Database["public"]["Enums"]["inventory_type"] | null
          is_featured?: boolean | null
          license_duration?: number | null
          name?: string
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"] | null
          requirements?: Json | null
          resale_auth_verified?: boolean | null
          sale_price?: number | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"] | null
          stock_quantity?: number | null
          stock_status?: string | null
          version?: string | null
          whats_included?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          updated_at: string
          value: Json
        }
        Insert: {
          id: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      claim_license: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: string
      }
      decrement_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      delivery_method:
        | "instant_download"
        | "email_delivery"
        | "license_key"
        | "external_link"
        | "manual_fulfillment"
      inventory_type: "unlimited" | "finite" | "license"
      license_status:
        | "available"
        | "assigned"
        | "expired"
        | "revoked"
        | "suspended"
      order_status:
        | "pending"
        | "processing"
        | "paid"
        | "completed"
        | "failed"
        | "cancelled"
        | "refunded"
        | "pending_payment"
        | "fulfilled"
      payment_provider:
        | "bkash"
        | "nagad"
        | "binance_pay"
        | "manual"
        | "bitget_pay"
        | "crypto_wallet"
        | "lemon_squeezy"
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
        | "created"
        | "expired"
        | "underpaid"
        | "overpaid"
        | "manual_review"
      product_status: "draft" | "active" | "out_of_stock" | "archived"
      product_type:
        | "ai_credits"
        | "ai_tools"
        | "browser_extensions"
        | "saas_products"
        | "digital_files"
        | "templates"
        | "prompts"
        | "automation_tools"
        | "developer_tools"
        | "services"
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
      app_role: ["admin", "user"],
      delivery_method: [
        "instant_download",
        "email_delivery",
        "license_key",
        "external_link",
        "manual_fulfillment",
      ],
      inventory_type: ["unlimited", "finite", "license"],
      license_status: [
        "available",
        "assigned",
        "expired",
        "revoked",
        "suspended",
      ],
      order_status: [
        "pending",
        "processing",
        "paid",
        "completed",
        "failed",
        "cancelled",
        "refunded",
        "pending_payment",
        "fulfilled",
      ],
      payment_provider: [
        "bkash",
        "nagad",
        "binance_pay",
        "manual",
        "bitget_pay",
        "crypto_wallet",
        "lemon_squeezy",
      ],
      payment_status: [
        "pending",
        "processing",
        "paid",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
        "created",
        "expired",
        "underpaid",
        "overpaid",
        "manual_review",
      ],
      product_status: ["draft", "active", "out_of_stock", "archived"],
      product_type: [
        "ai_credits",
        "ai_tools",
        "browser_extensions",
        "saas_products",
        "digital_files",
        "templates",
        "prompts",
        "automation_tools",
        "developer_tools",
        "services",
      ],
    },
  },
} as const
