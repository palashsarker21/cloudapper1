import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/notifications.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Clock, 
  Loader2, 
  ShoppingBag, 
  ShieldCheck, 
  MessageSquare,
  Package,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/account/notifications')({
  component: NotificationsPage,
});

function NotificationsPage() {
  const queryClient = useQueryClient();
  const fetchNotifications = useServerFn(getUserNotifications);
  const markRead = useServerFn(markNotificationRead);
  const markAllRead = useServerFn(markAllNotificationsRead);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markRead({ data: { notificationId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("All notifications marked as read");
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_placed': return <ShoppingBag className="h-5 w-5 text-primary" />;
      case 'payment_confirmed': return <CreditCard className="h-5 w-5 text-success" />;
      case 'order_fulfilled': return <Package className="h-5 w-5 text-success" />;
      case 'payment_failed': return <Bell className="h-5 w-5 text-destructive" />;
      case 'security': return <ShieldCheck className="h-5 w-5 text-warning" />;
      case 'support_reply': return <MessageSquare className="h-5 w-5 text-info" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
            <p className="text-muted-foreground">Stay updated on your orders and account activity.</p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={cn(
                  "border-2 transition-all cursor-pointer group hover:bg-surface-2",
                  notification.read ? "bg-surface-1 border-transparent opacity-80" : "bg-surface-2 border-primary/20 shadow-glow"
                )}
                onClick={() => !notification.read && markReadMutation.mutate(notification.id)}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={cn(
                        "font-semibold text-base leading-tight truncate",
                        notification.read ? "text-foreground/80" : "text-foreground"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {notification.related_order_id && (
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" asChild>
                            <Link to="/_authenticated/account/orders/$orderId" params={{ orderId: notification.related_order_id }}>
                              View Order <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                      {!notification.read && (
                        <Badge className="bg-primary hover:bg-primary">New</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed py-16 text-center bg-surface-1/50">
            <CardContent>
              <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <BellOff className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                You don't have any notifications at the moment. We'll alert you here for any important updates.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
