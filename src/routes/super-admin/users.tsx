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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  UserX,
  UserCheck,
  Edit,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute('/super-admin/users')({
  component: SuperAdminUsersPage,
});

function SuperAdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const fetchUsers = useServerFn(getSuperAdminUsers);
  const changeRole = useServerFn(updateUserRole);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['super-admin-users', searchTerm],
    queryFn: () => fetchUsers({ data: { search: searchTerm, limit: 20, offset: 0 } }),
  });

  const roleMutation = useMutation({
    mutationFn: (variables: { userId: string, role: string }) => 
      changeRole({ data: { targetUserId: variables.userId, role: variables.role } }),
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
            <h1 className="text-3xl font-black tracking-tighter">USER MANAGEMENT</h1>
            <p className="text-muted-foreground">Manage platform accounts and permissions</p>
          </div>
          <Button variant="primary">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="glass-effect rounded-2xl border-none shadow-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or ID..." 
                className="pl-10 bg-surface-2 border-none focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="glass-effect">Filters</Button>
              <Button variant="outline" size="sm" className="glass-effect">Export CSV</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-surface-1/50">
                  <TableRow>
                    <TableHead className="font-bold">User</TableHead>
                    <TableHead className="font-bold">Role</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Registered</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-surface-1/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{user.full_name || 'Anonymous User'}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                          <span className="text-[10px] text-muted-foreground/50 font-mono mt-1">{user.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles?.map((r: any) => (
                            <Badge key={r.role} variant={r.role === 'super_admin' ? 'default' : 'outline'} className="text-[10px] uppercase tracking-wider">
                              {r.role}
                            </Badge>
                          ))}
                          {(!user.roles || user.roles.length === 0) && (
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">customer</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                          ACTIVE
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 glass-effect border-none shadow-2xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Assign Role</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => roleMutation.mutate({ userId: user.id, role: 'admin' })}>
                              <Shield className="mr-2 h-4 w-4" /> Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => roleMutation.mutate({ userId: user.id, role: 'support' })}>
                              <Shield className="mr-2 h-4 w-4" /> Support
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <UserX className="mr-2 h-4 w-4" /> Suspend User
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
          
          <div className="p-4 border-t border-border/10 flex items-center justify-between text-xs text-muted-foreground">
            <div>Showing {users?.length || 0} of {users?.length || 0} users</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="glass-effect">Previous</Button>
              <Button variant="outline" size="sm" disabled className="glass-effect">Next</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
