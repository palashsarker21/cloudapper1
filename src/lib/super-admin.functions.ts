import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Validates if the user is a super_admin.
 * Always call this server-side before privileged operations.
 */
async function validateSuperAdmin(userId: string, supabase: any) {
  const { data: isSuperAdmin, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin",
  });
  
  if (error || !isSuperAdmin) {
    throw new Error("Unauthorized: Super Admin access required.");
  }
}

/**
 * Initial bootstrap for the first Super Admin.
 * Idempotent. Called by the Super Admin Dashboard or an entry hook.
 */
export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const initialEmail = "palashsarker1993@gmail.com";

    // 1. Get current user's email to verify if it's the target email
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.email !== initialEmail) {
      return { success: false, message: "Not authorized for bootstrap." };
    }

    // 2. Execute bootstrap RPC (idempotent)
    // We use a raw query if the RPC is not generated in types yet
    const { error } = await supabaseAdmin.rpc("bootstrap_super_admin" as any, {
      _email: initialEmail
    });

    if (error) {
      console.error("Bootstrap error:", error);
      throw error;
    }

    return { success: true, message: "Super Admin bootstrapped successfully." };
  });

/**
 * Gets overview stats for the God Mode Dashboard.
 */
export const getSystemStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    await validateSuperAdmin(userId, supabase);

    // Fetch counts in parallel for performance
    const [
      { count: usersCount },
      { count: ordersCount },
      { count: productsCount },
      { data: revenueData },
      { count: failedPayments }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('payments').select('amount').eq('status', 'paid'),
      supabaseAdmin.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'failed')
    ]);

    const totalRevenue = revenueData?.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 0;

    return {
      users: usersCount || 0,
      orders: ordersCount || 0,
      products: productsCount || 0,
      revenue: totalRevenue,
      pendingFulfillment: 0, // Placeholder if table missing
      failedPayments: failedPayments || 0,
      systemHealth: "Healthy"
    };
  });

/**
 * Gets audit logs for system transparency.
 */
export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    limit: z.number().default(50),
    offset: z.number().default(0)
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await validateSuperAdmin(userId, supabase);

    const { data: logs, error } = await supabaseAdmin
      .from('audit_logs' as any)
      .select(`
        *,
        actor:actor_id (email)
      `)
      .order('created_at', { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw error;
    return logs as any;
  });

/**
 * User Management for Super Admin
 */
export const getSuperAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    search: z.string().optional(),
    role: z.string().optional(),
    limit: z.number().default(20),
    offset: z.number().default(0)
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await validateSuperAdmin(userId, supabase);

    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        roles:user_roles (role)
      `);

    if (data.search) {
      query = query.or(`email.ilike.%${data.search}%,full_name.ilike.%${data.search}%`);
    }

    const { data: users, error } = await query
      .order('created_at', { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw error;
    return users;
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    targetUserId: z.string().uuid(),
    role: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await validateSuperAdmin(userId, supabase);

    // Upsert the role
    const { error } = await supabaseAdmin
      .from('user_roles' as any)
      .upsert({ 
        user_id: data.targetUserId, 
        role: data.role as any,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, role' });

    if (error) throw error;

    // Audit the action
    await supabaseAdmin.from('audit_logs' as any).insert({
      actor_id: userId,
      action: 'ROLE_CHANGED',
      target_type: 'user',
      target_id: data.targetUserId,
      metadata: { new_role: data.role } as any
    });

    return { success: true };
  });
