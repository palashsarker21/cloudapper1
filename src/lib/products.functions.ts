import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Database } from "@/integrations/supabase/types";

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export const getMarketplaceProducts = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    duration: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    sort: z.string().optional(),
    isFeatured: z.boolean().optional(),
    page: z.number().default(1),
    limit: z.number().default(12),
    availability: z.string().optional(),
    productType: z.string().optional(),
  }).optional().parse(data) || { page: 1, limit: 12 })
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from("products")
      .select("*, categories!inner(name, slug)", { count: 'exact' })
      .eq("status", "active");

    // Search logic (Relevance ranking via TSVector if available, or simple ILIKE)
    if (data.q) {
      const searchTerm = `%${data.q}%`;
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm}`);
    }

    if (data.category) {
      query = query.eq("categories.slug", data.category);
    }

    if (data.productType) {
      query = query.eq("product_type", data.productType as any);
    }
    
    if (data.isFeatured !== undefined) {
      query = query.eq("is_featured", data.isFeatured);
    }

    if (data.minPrice !== undefined) {
      query = query.gte("price", data.minPrice);
    }

    if (data.maxPrice !== undefined) {
      query = query.lte("price", data.maxPrice);
    }

    if (data.duration) {
      query = query.eq("license_duration", parseInt(data.duration));
    }

    if (data.availability === 'in_stock') {
      query = query.eq("stock_status", "in_stock");
    }

    // Apply sorting
    if (data.sort) {
      switch (data.sort) {
        case 'price:asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price:desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating:desc':
          // Placeholder for rating until real data exists
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    const from = (data.page - 1) * data.limit;
    const to = from + data.limit - 1;
    query = query.range(from, to);

    const { data: products, count, error } = await query;
    if (error) throw error;

    return {
      products,
      count: count || 0,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil((count || 0) / data.limit)
    };
  });

export const getSearchSuggestions = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    q: z.string().min(1)
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("name, slug, id")
      .eq("status", "active")
      .ilike("name", `%${data.q}%`)
      .limit(5);

    if (error) throw error;
    return products;
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((data) => z.string().parse(data))
  .handler(async ({ data: slug }) => {
    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return category;
  });

export const getRelatedProducts = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    productId: z.string(),
    categoryId: z.string().optional().nullable(),
    limit: z.number().default(4)
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from("products")
      .select("*, categories(name)")
      .eq("status", "active")
      .neq("id", data.productId)
      .limit(data.limit);

    if (data.categoryId) {
      query = query.eq("category_id", data.categoryId);
    }

    const { data: products, error } = await query;
    if (error) throw error;
    return products;
  });


export const getFeaturedProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*, categories(name)")
      .eq("status", "active")
      .eq("is_featured", true)
      .limit(4);

    if (error) throw error;
    return data;
  });

export const getProductById = createServerFn({ method: "GET" })
  .inputValidator((data) => z.string().parse(data))
  .handler(async ({ data: id }) => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*, categories(name)")
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error) throw error;
    return data;
  });

export const syncExtensionsCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    
    // Check if admin
    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: context.userId, 
      _role: 'admin' 
    });
    
    if (!isAdmin) throw new Error("Unauthorized");

    // 1. Ensure Marketplace Parent Category
    let { data: marketplaceCat } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', 'marketplace')
      .single();
    
    if (!marketplaceCat) {
      const { data: newCat, error } = await supabaseAdmin
        .from('categories')
        .insert({
          name: 'Marketplace',
          slug: 'marketplace',
          icon: 'Layers'
        })
        .select()
        .single();
      if (error) throw error;
      marketplaceCat = newCat;
    }

    // 2. Ensure Extensions Category
    let { data: extensionsCat } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', 'extensions')
      .single();
    
    if (!extensionsCat) {
      const { data: newCat, error } = await supabaseAdmin
        .from('categories')
        .insert({
          name: 'Extensions',
          slug: 'extensions',
          icon: 'Globe',
          description: 'Browser extensions and license keys'
        })
        .select()
        .single();
      if (error) throw error;
      extensionsCat = newCat;
    }

    const extensions = [
      {
        name: "Lovable Extension — 24 Hours",
        slug: "lovable-extension-24h",
        sku: "CA-EXT-24H",
        price: 100,
        license_duration: 1,
        is_featured: false,
        short_description: "24 Hours unlimited access Lovable-compatible browser extension.",
      },
      {
        name: "Lovable Extension — 3 Days",
        slug: "lovable-extension-3d",
        sku: "CA-EXT-3D",
        price: 300,
        license_duration: 3,
        is_featured: false,
        short_description: "3 Days unlimited access Lovable-compatible browser extension.",
      },
      {
        name: "Lovable Extension — 7 Days",
        slug: "lovable-extension-7d",
        sku: "CA-EXT-7D",
        price: 700,
        license_duration: 7,
        is_featured: false,
        short_description: "7 Days unlimited access Lovable-compatible browser extension.",
      },
      {
        name: "Lovable Extension — 15 Days",
        slug: "lovable-extension-15d",
        sku: "CA-EXT-15D",
        price: 1500,
        license_duration: 15,
        is_featured: false,
        short_description: "15 Days unlimited access Lovable-compatible browser extension.",
      },
      {
        name: "Lovable Extension — 30 Days",
        slug: "lovable-extension-30d",
        sku: "CA-EXT-30D",
        price: 3000,
        license_duration: 30,
        is_featured: true,
        short_description: "30 Days unlimited access Lovable-compatible browser extension.",
      },
      {
        name: "Lovable Extension — Lifetime",
        slug: "lovable-extension-lifetime",
        sku: "CA-EXT-LIFE",
        price: 12000,
        license_duration: 9999,
        is_featured: true,
        short_description: "Lifetime unlimited access Lovable-compatible browser extension.",
      }
    ];

    const commonFeatures = [
      "Unlimited access during the license period",
      "No Lovable credit limitation during the license period",
      "Automatic license delivery",
      "Instant license generation",
      "24/7 support",
      "Browser extension access",
      "Recommended for Microsoft Edge",
      "Recommended for Brave",
      "Works with supported desktop browser environments",
      "Fresh Lovable account and fresh browser session recommended"
    ];

    const commonCompatibility = {
      environments: ["Desktop browser", "Supported Chromium browsers"],
      browsers: ["Chrome", "Microsoft Edge", "Brave", "Chromium-based browsers"],
      mobile: "Not universally supported. Verified environments only."
    };

    const commonInstructions = "Compatibility and availability may depend on the current extension, browser and third-party service environment. Please review the current product instructions before purchase. Always keep a backup of your project and important data using services such as GitHub and Supabase.";

    const results = [];
    for (const ext of extensions) {
      const productData: ProductInsert = {
        name: ext.name,
        slug: ext.slug,
        sku: ext.sku,
        price: ext.price,
        currency: 'BDT',
        category_id: extensionsCat!.id,
        product_type: 'browser_extensions',
        inventory_type: 'license',
        delivery_method: 'license_key',
        license_duration: ext.license_duration,
        is_featured: ext.is_featured,
        short_description: ext.short_description,
        full_description: ext.short_description + " " + commonInstructions,
        features: JSON.parse(JSON.stringify(commonFeatures)),
        compatibility: JSON.parse(JSON.stringify(commonCompatibility)),
        delivery_instructions: "Your license key will be generated instantly after payment verification. " + commonInstructions,
        status: 'active',
        stock_status: 'in_stock',
        image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800"
      };

      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', ext.sku)
        .single();
      
      if (existing) {
        const { error } = await supabaseAdmin
          .from('products')
          .update(productData as ProductUpdate)
          .eq('id', existing.id);
        if (error) throw error;
        results.push({ sku: ext.sku, action: 'updated' });
      } else {
        const { error } = await supabaseAdmin
          .from('products')
          .insert(productData);
        if (error) throw error;
        results.push({ sku: ext.sku, action: 'created' });
      }
    }

    return results;
  });
