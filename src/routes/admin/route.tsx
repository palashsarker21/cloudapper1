import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/admin')({
  ssr: false,
  beforeLoad: async () => {
    // 1. Ensure user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw redirect({ to: '/login' })
    }

    // 2. Ensure user has admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    if (roleError || !isAdmin) {
      // In a real app, you might redirect to a "Forbidden" page or home
      throw redirect({ to: '/' })
    }

    return { user, isAdmin }
  },
  component: () => <Outlet />,
})
