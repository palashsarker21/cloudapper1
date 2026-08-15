import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Internal helper to validate super_admin status
const validateSuperAdmin = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const { data: isSuperAdmin } = await supabase.rpc('has_role' as any, {
    _user_id: user.id,
    _role: 'super_admin'
  });

  if (!isSuperAdmin) throw new Error("Forbidden: Super Admin access required");
  return user;
};

export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .handler(async () => {
    // Only call RPC which is idempotent and restricted to specific email
    const { data, error } = await supabase.rpc('bootstrap_super_admin' as any);
    
    if (error) {
      console.error("Bootstrap error:", error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: data || "Bootstrap completed" };
  });

export const getSystemStats = createServerFn({ method: "GET" })
  .handler(async () => {
    await validateSuperAdmin();

    const [usersCount, productsCount, ordersCount, revenueSum, logsData, saCount] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'paid'),
      supabase.from('audit_logs' as any).select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('user_roles' as any).select('*', { count: 'exact', head: true }).eq('role', 'super_admin')
    ]);

    // Enhance logs with emails
    const enrichedLogs = await Promise.all(((logsData.data as any[]) || []).map(async (log) => {
      if (log.user_id) {
        const { data } = await supabase.from('profiles').select('email').eq('id', log.user_id).single();
        return { ...log, user_email: (data as any)?.email };
      }
      return log;
    }));

    return {
      totalUsers: usersCount.count || 0,
      totalProducts: productsCount.count || 0,
      totalOrders: ordersCount.count || 0,
      totalRevenue: (revenueSum.data as any[])?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
      recentLogs: enrichedLogs,
      superAdminsCount: saCount.count || 1
    };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .handler(async () => {
    await validateSuperAdmin();

    const { data: logs, error } = await (supabase
      .from('audit_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100) as any);

    if (error) throw error;

    // Enhance logs with emails
    const enrichedLogs = await Promise.all(((logs as any[]) || []).map(async (log) => {
      if (log.user_id) {
        const { data } = await supabase.from('profiles').select('email').eq('id', log.user_id).single();
        return { ...log, user_email: (data as any)?.email };
      }
      return log;
    }));

    return enrichedLogs;
  });

export const getSuperAdminUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    await validateSuperAdmin();

    const { data: roles, error } = await supabase
      .from('user_roles' as any)
      .select(`
        role,
        user_id,
        created_at,
        profiles!user_id (id, full_name, email)
      `);

    if (error) throw error;

    return (roles as any[]).map((r: any) => ({
      id: r.user_id,
      role: r.role,
      created_at: r.created_at,
      full_name: r.profiles?.full_name,
      email: r.profiles?.email
    }));
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string().uuid(),
    role: z.enum(['super_admin', 'admin', 'manager', 'support', 'customer'])
  }))
  .handler(async ({ data: { userId, role } }) => {
    const actor = await validateSuperAdmin();

    // Prevent removing own super_admin role if only one exists
    if (actor.id === userId && role !== 'super_admin') {
      const { count } = await (supabase.from('user_roles' as any).select('*', { count: 'exact', head: true }).eq('role', 'super_admin') as any);
      if (count && count <= 1) throw new Error("Cannot remove the last super admin");
    }

    const { error } = await supabase
      .from('user_roles' as any)
      .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });

    if (error) throw error;

    // Log the change
    await supabase.from('audit_logs' as any).insert({
      user_id: actor.id,
      action: 'UPDATE',
      resource_type: 'user_roles',
      resource_id: userId,
      metadata: { new_role: role }
    } as any);

    return { success: true };
  });
