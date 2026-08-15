import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getUserNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from('notifications' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    notificationId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { notificationId } = data;
    const { userId } = context;

    const { error } = await supabaseAdmin
      .from('notifications' as any)
      .update({ read: true } as any)
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { error } = await supabaseAdmin
      .from('notifications' as any)
      .update({ read: true } as any)
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { success: true };
  });
