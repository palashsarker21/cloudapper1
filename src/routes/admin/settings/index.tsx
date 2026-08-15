import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin/settings/')({
  beforeLoad: async () => {
    // 1. Ensure user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw redirect({ to: '/login' })
    }

    // 2. Ensure user has admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role' as any, {
      _user_id: user.id,
      _role: 'admin'
    }) as { data: boolean, error: any };

    const { data: isSuperAdmin } = await supabase.rpc('has_role' as any, {
      _user_id: user.id,
      _role: 'super_admin'
    }) as { data: boolean, error: any };

    if (roleError || (!isAdmin && !isSuperAdmin)) {
      console.warn("Unauthorized access attempt to /admin/settings by user:", user.id);
      throw redirect({ to: '/' })
    }

    // Redirect to the first specific settings page
    throw redirect({ to: '/admin/settings/payments' })
  },
  component: () => null
});
