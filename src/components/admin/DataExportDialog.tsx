import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Download, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DataExportDialogProps {
  title: string;
  description: string;
  exportFn: (args: { data: any }) => Promise<{ csv: string; filename: string }>;
  statusOptions?: { label: string; value: string }[];
}

export function DataExportDialog({ title, description, exportFn, statusOptions }: DataExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    order_id: '',
    user_id: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportFn({ data: filters });
      
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', result.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export completed successfully');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="glass-effect">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order_id" className="text-right text-xs">
              Order ID
            </Label>
            <Input
              id="order_id"
              placeholder="UUID"
              className="col-span-3 h-8 text-xs"
              value={filters.order_id}
              onChange={(e) => setFilters({ ...filters, order_id: e.target.value })}
            />
          </div>
          
          {statusOptions && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-xs">
                Status
              </Label>
              <div className="col-span-3">
                <Select 
                  value={filters.status} 
                  onValueChange={(val) => setFilters({ ...filters, status: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date_from" className="text-right text-xs">
              From
            </Label>
            <Input
              id="date_from"
              type="date"
              className="col-span-3 h-8 text-xs"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date_to" className="text-right text-xs">
              To
            </Label>
            <Input
              id="date_to"
              type="date"
              className="col-span-3 h-8 text-xs"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
