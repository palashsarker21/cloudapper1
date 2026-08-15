import { Database } from "@/integrations/supabase/types";

/**
 * CloudApper Type Guide & Registry
 * This file serves as a central reference for all core domain types, enums, 
 * and database entities used across the CloudApper platform.
 */

// --- 1. Database Entity Types (Generated from Supabase) ---

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type License = Database["public"]["Tables"]["licenses"]["Row"];
export type Fulfillment = Database["public"]["Tables"]["fulfillments"]["Row"];
export type Entitlement = Database["public"]["Tables"]["entitlements"]["Row"];
export type CryptoWallet = Database["public"]["Tables"]["crypto_wallets"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type Setting = Database["public"]["Tables"]["settings"]["Row"];

// --- 2. Enums & Literal Types ---

export type AppRole = Database["public"]["Enums"]["app_role"]; // 'admin' | 'user' | 'super_admin'
export type ProductStatus = Database["public"]["Enums"]["product_status"]; // 'draft' | 'active' | 'out_of_stock' | 'archived'
export type ProductType = Database["public"]["Enums"]["product_type"]; 
/* 
  'ai_credits' | 'ai_tools' | 'browser_extensions' | 'saas_products' | 
  'digital_files' | 'templates' | 'prompts' | 'automation_tools' | 
  'developer_tools' | 'services' 
*/

export type OrderStatus = Database["public"]["Enums"]["order_status"];
/*
  'pending' | 'processing' | 'paid' | 'completed' | 'failed' | 
  'cancelled' | 'refunded' | 'pending_payment' | 'fulfilled'
*/

export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
/*
  'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 
  'refunded' | 'partially_refunded' | 'created' | 'expired' | 
  'underpaid' | 'overpaid' | 'manual_review'
*/

export type FulfillmentStatus = Database["public"]["Enums"]["fulfillment_status"];
export type LicenseStatus = Database["public"]["Enums"]["license_status"];
export type DeliveryMethod = Database["public"]["Enums"]["delivery_method"];

// --- 3. Composite UI & Domain Types ---

/**
 * Detailed Product view often used in Marketplace listings
 */
export interface ProductWithCategory extends Product {
  category?: Category | null;
}

/**
 * Full Order details including items and payment info
 */
export interface OrderWithDetails extends Order {
  items: OrderItem[];
  payments?: Payment[];
  fulfillments?: Fulfillment[];
}

/**
 * License with associated product and fulfillment context
 */
export interface LicenseDetails extends License {
  product?: Product | null;
  fulfillment?: Fulfillment | null;
}

// --- 4. Brand Design Tokens (Reference) ---
// See src/lib/brand.ts for implementation
export interface BrandConfig {
  name: string;
  url: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
  };
}
