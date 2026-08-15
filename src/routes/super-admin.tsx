import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/super-admin')({
  ssr: false,
  beforeLoad: async () => {
    // 1. Ensure user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw redirect({ to: '/login' })
    }

    // 2. Ensure user has super_admin role
    // Using has_role RPC which was created in the migration
    const { data: isSuperAdmin, error: roleError } = await supabase.rpc('has_role' as any, {
      _user_id: user.id,
      _role: 'super_admin'
    }) as { data: boolean, error: any };

    if (roleError || !isSuperAdmin) {
      // Access denied for non-super_admins
      console.warn("Unauthorized access attempt to /super-admin by user:", user.id);
      
      // Secondary check for 'admin' role to redirect to admin dashboard instead of home
      const { data: isAdmin } = await supabase.rpc('has_role' as any, {
        _user_id: user.id,
        _role: 'admin'
      }) as { data: boolean, error: any };
      
      if (isAdmin) {
        throw redirect({ to: '/admin/products' })
      }
      
      throw redirect({ to: '/' })
    }

    return { user, isSuperAdmin }
  },
  component: () => <Outlet />,
})
