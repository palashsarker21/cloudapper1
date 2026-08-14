import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getLicenseInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    productId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) throw new Error("Unauthorized");

    const { data: licenses, error } = await supabaseAdmin
      .from("product_licenses")
      .select("*")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Mask keys by default
    return licenses.map(l => ({
      ...l,
      license_key: l.license_key.substring(0, 4) + "****" + l.license_key.substring(l.license_key.length - 4)
    }));
  });

export const updateLicenseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    licenseId: z.string().uuid(),
    status: z.enum(["active", "revoked", "suspended", "expired"]),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("product_licenses")
      .update({ status: data.status })
      .eq("id", data.licenseId);

    if (error) throw error;
    return { success: true };
  });

export const addLicenseKeys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    productId: z.string().uuid(),
    keys: z.array(z.string().min(1)),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) throw new Error("Unauthorized");

    const newLicenses = data.keys.map(key => ({
      product_id: data.productId,
      license_key: key,
      status: "active" as const
    }));

    const { error } = await supabaseAdmin
      .from("product_licenses")
      .insert(newLicenses);

    if (error) throw error;
    return { success: true };
  });
