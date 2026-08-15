import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getAuditLogs } from '@/lib/super-admin.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ShieldAlert,
  Database,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute('/super-admin/audit-logs')({
  component: SuperAdminAuditLogsPage,
});

function SuperAdminAuditLogsPage() {
  const fetchLogs = useServerFn(getAuditLogs);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['super-admin-audit-logs'],
    queryFn: () => fetchLogs(),
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
              <History className="h-8 w-8 text-primary" /> Immutable Audit Trail
            </h1>
            <p className="text-muted-foreground">Cryptographically indexed platform activity logs</p>
          </div>
          
          <Button variant="outline" className="glass-effect">
            <Download className="mr-2 h-4 w-4" /> Export Evidence
          </Button>
        </div>

        <div className="glass-effect rounded-2xl border-none shadow-xl overflow-hidden">
          <div className="p-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-1/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs by user, action or resource..." 
                className="pl-10 bg-surface-2 border-none focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-[10px] uppercase font-bold tracking-widest glass-effect">
                <Filter className="h-3 w-3 mr-2" /> All Systems
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground italic">Reconstructing temporal sequence...</div>
            ) : (
              <Table>
                <TableHeader className="bg-surface-1/50">
                  <TableRow>
                    <TableHead className="font-bold">Timestamp</TableHead>
                    <TableHead className="font-bold">Agent</TableHead>
                    <TableHead className="font-bold">Action</TableHead>
                    <TableHead className="font-bold">Resource</TableHead>
                    <TableHead className="font-bold text-right">Evidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-surface-1/30 transition-colors">
                      <TableCell className="text-[10px] font-mono text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-primary" />
                          <span className="text-xs font-bold">{log.user_email || 'System Authority'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-tighter ${
                          log.action === 'INSERT' ? 'border-emerald-500/50 text-emerald-500' :
                          log.action === 'UPDATE' ? 'border-amber-500/50 text-amber-500' :
                          'border-red-500/50 text-red-500'
                        }`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold flex items-center gap-1">
                            <Database className="h-3 w-3 opacity-50" /> {log.resource_type}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground uppercase">{log.resource_id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl glass-effect border-none shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                Audit Data Verification
                              </DialogTitle>
                            </DialogHeader>
                            <div className="bg-surface-2 p-4 rounded-xl border border-border/10 overflow-auto max-h-[60vh]">
                              <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                        No temporal records detected. Platform integrity is pristine.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
