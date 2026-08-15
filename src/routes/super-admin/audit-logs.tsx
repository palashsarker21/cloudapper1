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
import { 
  Activity, 
  Clock, 
  User, 
  Database, 
  ShieldCheck, 
  Info,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/super-admin/audit-logs')({
  component: SuperAdminAuditLogsPage,
});

function SuperAdminAuditLogsPage() {
  const fetchLogs = useServerFn(getAuditLogs);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['super-admin-audit-logs'],
    queryFn: () => fetchLogs({ data: { limit: 50, offset: 0 } }),
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Platform Integrity</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">IMMUTABLE AUDIT LOGS</h1>
            <p className="text-muted-foreground">Traceability and transparency for every administrative action</p>
          </div>
          
          <Button variant="outline" className="glass-effect">
            <Download className="mr-2 h-4 w-4" />
            Export Audit Trail
          </Button>
        </div>

        <div className="glass-effect rounded-2xl border-none shadow-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-1/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by action, user, or ID..." 
                className="pl-10 bg-surface-2 border-none focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="glass-effect">
                <Filter className="h-4 w-4 mr-2" />
                Event Types
              </Button>
              <Button variant="outline" size="sm" className="glass-effect">
                <Clock className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground">Retrieving platform history...</div>
            ) : (
              <Table>
                <TableHeader className="bg-surface-1/50">
                  <TableRow>
                    <TableHead className="font-bold">Timestamp</TableHead>
                    <TableHead className="font-bold">Actor</TableHead>
                    <TableHead className="font-bold">Action</TableHead>
                    <TableHead className="font-bold">Target</TableHead>
                    <TableHead className="font-bold text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-surface-1/30 transition-colors group">
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-surface-2 flex items-center justify-center">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm font-semibold">{log.actor?.email || 'SYSTEM'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-surface-2 border-none">
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <Database className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground uppercase">{log.target_type}:</span>
                          <span className="font-mono text-[10px]">{log.target_id?.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors">
                            <Info className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                         No audit events recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          
          <div className="p-4 bg-surface-1/10 border-t border-border/10 flex justify-between items-center text-xs text-muted-foreground">
             <span>Platform Integrity: Verified Immutable Audit Chain</span>
             <span className="font-mono uppercase">Request ID: God-Mode-Session</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
