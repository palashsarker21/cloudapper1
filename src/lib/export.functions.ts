import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ExportFilterSchema = z.object({
  order_id: z.string().uuid().optional().or(z.literal("")),
  user_id: z.string().uuid().optional().or(z.literal("")),
  status: z.string().optional().or(z.literal("")),
  date_from: z.string().optional().or(z.literal("")),
  date_to: z.string().optional().or(z.literal("")),
});

type ExportFilters = z.infer<typeof ExportFilterSchema>;

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function verifyAdmin(context: any) {
  const { userId, supabase } = context;
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  
  if (isAdmin) return true;

  const { data: isSuperAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin",
  });

  if (isSuperAdmin) return true;

  throw new Error("Unauthorized");
}

export const exportLicensesCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ExportFilterSchema.parse(data))
  .handler(async ({ data, context }) => {
    await verifyAdmin(context);

    let query = supabaseAdmin
      .from("licenses" as any)
      .select(`
        id,
        order_id,
        customer_id,
        product_id,
        status,
        provider,
        license_key_last4,
        plan,
        created_at,
        expires_at,
        products(name),
        profiles:customer_id(email)
      `);

    if (data.order_id) query = query.eq("order_id", data.order_id);
    if (data.user_id) query = query.eq("customer_id", data.user_id);
    if (data.status) query = query.eq("status", data.status);
    if (data.date_from) query = query.gte("created_at", data.date_from);
    if (data.date_to) query = query.lte("created_at", data.date_to);

    const { data: licenses, error } = await (query.order("created_at", { ascending: false }) as any);
    if (error) throw error;

    const headers = ["ID", "Order ID", "Customer Email", "Product", "Plan", "Status", "Key (Last4)", "Provider", "Created At", "Expires At"];
    const rows = (licenses || []).map((l: any) => [
      l.id,
      l.order_id,
      l.profiles?.email || "",
      l.products?.name || "",
      l.plan || "",
      l.status,
      l.license_key_last4,
      l.provider,
      l.created_at,
      l.expires_at || ""
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map(row => row.map(escapeCsv).join(","))
    ].join("\n");

    return { csv: csvContent, filename: `licenses_${new Date().toISOString().split('T')[0]}.csv` };
  });

export const exportFulfillmentsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ExportFilterSchema.parse(data))
  .handler(async ({ data, context }) => {
    await verifyAdmin(context);

    let query = supabaseAdmin
      .from("fulfillments" as any)
      .select(`
        id,
        order_id,
        status,
        fulfillment_type,
        metadata,
        error_message,
        created_at,
        completed_at,
        orders(customer_email, customer_name)
      `);

    if (data.order_id) query = query.eq("order_id", data.order_id);
    if (data.status) query = query.eq("status", data.status);
    if (data.date_from) query = query.gte("created_at", data.date_from);
    if (data.date_to) query = query.lte("created_at", data.date_to);

    const { data: fulfillments, error } = await (query.order("created_at", { ascending: false }) as any);
    if (error) throw error;

    const headers = ["ID", "Order ID", "Customer Name", "Customer Email", "Type", "Status", "Product Name", "Created At", "Completed At", "Error"];
    const rows = (fulfillments || []).map((f: any) => [
      f.id,
      f.order_id,
      f.orders?.customer_name || "",
      f.orders?.customer_email || "",
      f.fulfillment_type,
      f.status,
      f.metadata?.product_name || "",
      f.created_at,
      f.completed_at || "",
      f.error_message || ""
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map(row => row.map(escapeCsv).join(","))
    ].join("\n");

    return { csv: csvContent, filename: `fulfillments_${new Date().toISOString().split('T')[0]}.csv` };
  });
