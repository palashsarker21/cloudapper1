import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/settings/security")({
  beforeLoad: ({ context }: any) => {
    if (!context.isAdmin) {
      throw redirect({ to: '/' });
    }
  },
  component: AdminSecuritySettings,
});

function AdminSecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security & Access</h1>
        <p className="text-muted-foreground">Manage administrative roles and system security.</p>
      </div>

      <Card className="bg-surface-1 border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            RBAC Status
          </CardTitle>
          <CardDescription>Role-Based Access Control is active.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
            <Lock className="h-4 w-4" />
            Database RLS policies are strictly enforced.
          </div>
          <p className="text-sm text-muted-foreground">
            Administrative access is granted via the `user_roles` system. Only users with the `admin` role can access these management interfaces.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
