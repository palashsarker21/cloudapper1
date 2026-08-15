import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

export const Route = createFileRoute("/admin/settings/")({
  component: AdminGeneralSettings,
});

function AdminGeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground">Global configuration for the CloudApper marketplace.</p>
      </div>

      <Card className="bg-surface-1 border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Environment Info
          </CardTitle>
          <CardDescription>Managed via server configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-muted-foreground">Store Domain</span>
              <p className="font-medium text-lg">cloudapper.online</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-muted-foreground">Tech Stack</span>
              <p className="font-medium">React 19 / TanStack Start / Supabase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
