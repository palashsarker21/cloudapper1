import { Database } from "@/integrations/supabase/types";

/**
 * CloudApper Type Guide & Registry
 * This file serves as a central reference for all core domain types, enums, 
 * and database entities used across the CloudApper platform.
 * 
 * @usage
 * import { Product, OrderStatus } from "@/lib/types-guide";
 */

// --- 1. Database Entity Types (Generated from Supabase) ---

/**
 * Core Product entity representing items for sale (AI tools, extensions, etc.)
 */
export type Product = Database["public"]["Tables"]["products"]["Row"];

/**
 * Customer Order tracking financial transaction and fulfillment progress
 */
export type Order = Database["public"]["Tables"]["orders"]["Row"];

/**
 * Individual items within an Order
 */
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

/**
 * Payment transaction record associated with an Order
 */
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

/**
 * Digital license key generated for an extension or software product
 */
export type License = Database["public"]["Tables"]["licenses"]["Row"];

/**
 * Execution record for the digital delivery process
 */
export type Fulfillment = Database["public"]["Tables"]["fulfillments"]["Row"];

/**
 * Customer entitlement to access a specific product or digital asset
 */
export type Entitlement = Database["public"]["Tables"]["entitlements"]["Row"];

/**
 * Admin-configured crypto destination for manual payment verification
 */
export type CryptoWallet = Database["public"]["Tables"]["crypto_wallets"]["Row"];

/**
 * Product category for marketplace organization
 */
export type Category = Database["public"]["Tables"]["categories"]["Row"];

/**
 * RBAC role mapping for users (super_admin, admin, user)
 */
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];

/**
 * Promotional discount code
 */
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

/**
 * System-wide configuration settings (e.g., payment gateway credentials)
 */
export type Setting = Database["public"]["Tables"]["settings"]["Row"];

// --- 2. Enums & Literal Types ---

/**
 * User permission levels
 * @example
 * const role: AppRole = 'super_admin';
 */
export type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * Lifecycle status of a product listing
 */
export type ProductStatus = Database["public"]["Enums"]["product_status"];

/**
 * Categorization for specialized fulfillment logic
 * @example
 * if (product.type === 'browser_extensions') {
 *   // Trigger Eklas license generation
 * }
 */
export type ProductType = Database["public"]["Enums"]["product_type"]; 

/**
 * State of a customer order
 * - `paid`: Funds verified, ready for fulfillment
 * - `fulfilled`: All digital assets delivered
 */
export type OrderStatus = Database["public"]["Enums"]["order_status"];

/**
 * Payment lifecycle tracking
 * - `manual_review`: Awaiting admin TXID verification
 */
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

/**
 * Fulfillment job status
 */
export type FulfillmentStatus = Database["public"]["Enums"]["fulfillment_status"];

/**
 * Individual license key status
 */
export type LicenseStatus = Database["public"]["Enums"]["license_status"];

/**
 * How a product is delivered to the customer
 */
export type DeliveryMethod = Database["public"]["Enums"]["delivery_method"];

// --- 3. Composite UI & Domain Types ---

/**
 * Detailed Product view often used in Marketplace listings
 * @usage
 * const listing: ProductWithCategory = { ...product, category: { name: 'AI Tools' } };
 */
export interface ProductWithCategory extends Product {
  category?: Category | null;
}

/**
 * Full Order details including items and payment info
 * @usage
 * function OrderDetails({ order }: { order: OrderWithDetails }) {
 *   return order.items.map(item => <ItemRow key={item.id} item={item} />);
 * }
 */
export interface OrderWithDetails extends Order {
  items: OrderItem[];
  payments?: Payment[];
  fulfillments?: Fulfillment[];
}

/**
 * License with associated product and fulfillment context
 * Used in the Super Admin License Center.
 */
export interface LicenseDetails extends License {
  product?: Product | null;
  fulfillment?: Fulfillment | null;
}

// --- 4. Brand Design Tokens (Reference) ---
// See src/lib/brand.ts for implementation

/**
 * Global brand configuration object
 */
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

/**
 * USAGE EXAMPLES FOR DEVELOPERS
 * 
 * 1. Filtering by Product Type:
 * const extensions = allProducts.filter((p): p is Product => p.type === 'browser_extensions');
 * 
 * 2. Checking Admin Permissions:
 * const isAdmin = (userRole: AppRole) => ['admin', 'super_admin'].includes(userRole);
 * 
 * 3. Handling Order Status:
 * switch (order.status) {
 *   case 'paid': 
 *     return <Badge>Payment Verified</Badge>;
 *   case 'fulfilled': 
 *     return <Badge variant="success">Delivered</Badge>;
 *   default: 
 *     return <Badge variant="secondary">{order.status}</Badge>;
 * }
 */
