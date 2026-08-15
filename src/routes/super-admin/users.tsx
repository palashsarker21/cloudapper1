import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getSuperAdminUsers, updateUserRole } from '@/lib/super-admin.functions';
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
  Search, 
  UserPlus, 
  Shield, 
  MoreVertical, 
  UserCheck, 
  UserX,
  ShieldAlert,
  Mail,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export const Route = createFileRoute('/super-admin/users')({
  component: SuperAdminUsersPage,
});

function SuperAdminUsersPage() {
  const fetchUsers = useServerFn(getSuperAdminUsers);
  const updateRole = useServerFn(updateUserRole);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: () => fetchUsers(),
  });

  const mutation = useMutation({
    mutationFn: (variables: { userId: string, role: string }) => 
      updateRole({ data: { userId: variables.userId, role: variables.role as any } }),
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetch();
    },
    onError: () => toast.error("Failed to update user role")
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Citizen Records</h1>
            <p className="text-muted-foreground">Manage platform access and role hierarchy</p>
          </div>
          
          <Button variant="default">
            <UserPlus className="mr-2 h-4 w-4" /> Invite User
          </Button>
        </div>

        <div className="glass-effect rounded-2xl border-none shadow-xl overflow-hidden">
          <div className="p-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-1/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search citizens by name or email..." 
                className="pl-10 bg-surface-2 border-none focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-surface-2 border-none text-[10px] uppercase font-bold">
                Total: {users?.length || 0}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground italic">Decrypting user records...</div>
            ) : (
              <Table>
                <TableHeader className="bg-surface-1/50">
                  <TableRow>
                    <TableHead className="font-bold">Identity</TableHead>
                    <TableHead className="font-bold">Role</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Joined</TableHead>
                    <TableHead className="font-bold text-right">Access Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-surface-1/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-xs border border-border/10 shadow-inner">
                            {user.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{user.full_name || 'Classified Identity'}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'super_admin' ? 'destructive' : 'outline'} className="text-[10px] font-black uppercase tracking-widest px-2">
                          <Shield className="mr-1 h-3 w-3" /> {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-[8px] uppercase">Active</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-surface-2">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-effect border-none shadow-2xl min-w-[160px]">
                            <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Elevate Privileges</div>
                            <DropdownMenuItem onClick={() => mutation.mutate({ userId: user.id, role: 'super_admin' })}>
                              <ShieldAlert className="mr-2 h-4 w-4 text-destructive" /> Super Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => mutation.mutate({ userId: user.id, role: 'admin' })}>
                              <Shield className="mr-2 h-4 w-4 text-primary" /> Administrator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => mutation.mutate({ userId: user.id, role: 'user' })}>
                              <UserCheck className="mr-2 h-4 w-4" /> Standard User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/10" />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <UserX className="mr-2 h-4 w-4" /> Revoke Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
