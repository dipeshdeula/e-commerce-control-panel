import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit, Plus, RotateCcw, Trash2, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShippingForm {
  name: string;
  lowOrderThreshold: number;
  lowOrderShippingCost: number;
  highOrderShippingCost: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: number;
  maxDeliveryDistanceKm: number;
  enableFreeShippingEvents: boolean;
  isFreeShippingActive: boolean;
  freeShippingStartDate?: string;
  freeShippingEndDate?: string;
  freeShippingDescription?: string;
  weekendSurcharge?: number;
  holidaySurcharge?: number;
  rushDeliverySurcharge?: number;
  customerMessage?: string;
  adminNotes?: string;
  setAsDefault?: boolean;
}

const defaultForm: ShippingForm = {
  name: '',
  lowOrderThreshold: 0,
  lowOrderShippingCost: 0,
  highOrderShippingCost: 0,
  freeShippingThreshold: 0,
  estimatedDeliveryDays: 1,
  maxDeliveryDistanceKm: 0,
  enableFreeShippingEvents: false,
  isFreeShippingActive: false,
  freeShippingStartDate: '',
  freeShippingEndDate: '',
  freeShippingDescription: '',
  weekendSurcharge: 0,
  holidaySurcharge: 0,
  rushDeliverySurcharge: 0,
  customerMessage: '',
  adminNotes: '',
  setAsDefault: false,
};

const formatDateInput = (v?: string) => v || '';

const ShippingManagement: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<ShippingForm>({ ...defaultForm });

  const [pageNumber] = useState(1);
  const [pageSize] = useState(10);

  const { data } = useQuery({
    queryKey: ['shippingConfigurations', pageNumber, pageSize],
    queryFn: async () => {
      const res = await apiService.getAllShippingConfigurations(pageNumber, pageSize);
      const payload = res.data as any;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      return list as any[];
    }
  });

  const list = useMemo(() => (data || []).filter((c: any) => {
    const t = search.toLowerCase();
    return (
      (c.configurationName || c.name || '').toLowerCase().includes(t)
    );
  }), [data, search]);

  const createMut = useMutation({
    mutationFn: async (payload: ShippingForm) => {
      const res = await apiService.createShippingConfiguration(payload as any);
      if (!(res as any).message) throw new Error('Create failed');
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shippingConfigurations'] });
      setCreateOpen(false);
      setForm({ ...defaultForm });
      toast({ title: 'Shipping configuration created' });
    },
    onError: (e: any) => toast({ title: 'Create failed', description: e.message, variant: 'destructive' })
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<ShippingForm> }) => {
      const res = await apiService.updateShippingConfiguration(id, payload as any);
      if (!(res as any).message) throw new Error('Update failed');
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shippingConfigurations'] });
      setEditOpen(false);
      setSelected(null);
      toast({ title: 'Shipping configuration updated' });
    },
    onError: (e: any) => toast({ title: 'Update failed', description: e.message, variant: 'destructive' })
  });

  const setDefaultMut = useMutation({
    mutationFn: async (id: number) => apiService.setDefaultShippingConfiguration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shippingConfigurations'] });
      toast({ title: 'Set as default' });
    },
    onError: (e: any) => toast({ title: 'Set default failed', description: e.message, variant: 'destructive' })
  });

  const softDeleteMut = useMutation({
    mutationFn: async (id: number) => apiService.softDeleteShippingConfiguration(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shippingConfigurations'] }); toast({ title: 'Configuration deleted (soft)' }); },
    onError: (e: any) => toast({ title: 'Soft delete failed', description: e.message, variant: 'destructive' })
  });

  const hardDeleteMut = useMutation({
    mutationFn: async (id: number) => apiService.hardDeleteShippingConfiguration(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shippingConfigurations'] }); toast({ title: 'Configuration deleted (hard)' }); },
    onError: (e: any) => toast({ title: 'Hard delete failed', description: e.message, variant: 'destructive' })
  });

  const onEdit = (item: any) => {
    setSelected(item);
    setForm({
      name: item.configurationName || item.name || '',
      lowOrderThreshold: item.lowOrderThreshold ?? 0,
      lowOrderShippingCost: item.lowOrderShippingCost ?? 0,
      highOrderShippingCost: item.highOrderShippingCost ?? 0,
      freeShippingThreshold: item.freeShippingThreshold ?? 0,
      estimatedDeliveryDays: item.estimatedDeliveryDays ?? 1,
      maxDeliveryDistanceKm: item.maxDeliveryDistanceKm ?? 0,
      enableFreeShippingEvents: !!item.enableFreeShippingEvents,
      isFreeShippingActive: !!item.isFreeShippingActive,
      freeShippingStartDate: formatDateInput(item.freeShippingStartDate),
      freeShippingEndDate: formatDateInput(item.freeShippingEndDate),
      freeShippingDescription: item.freeShippingDescription || '',
      weekendSurcharge: item.weekendSurcharge ?? 0,
      holidaySurcharge: item.holidaySurcharge ?? 0,
      rushDeliverySurcharge: item.rushDeliverySurcharge ?? 0,
      customerMessage: item.customerMessage || '',
      adminNotes: item.adminNotes || '',
      setAsDefault: !!item.isDefault,
    });
    setEditOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected?.id) {
      updateMut.mutate({ id: selected.id, payload: form });
    } else {
      createMut.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600">Create and manage shipping thresholds</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelected(null); setForm({ ...defaultForm }); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Shipping Threshold
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <form onSubmit={onSubmit}>
              <DialogHeader>
                <DialogTitle>Create Shipping Threshold</DialogTitle>
                <DialogDescription>Configure shipping costs and free shipping rules</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="grid gap-2 md:col-span-3">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lowOrderThreshold">Low Order Threshold</Label>
                  <Input id="lowOrderThreshold" type="number" value={form.lowOrderThreshold} onChange={e => setForm({ ...form, lowOrderThreshold: Number(e.target.value) })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lowOrderShippingCost">Low Order Shipping Cost</Label>
                  <Input id="lowOrderShippingCost" type="number" value={form.lowOrderShippingCost} onChange={e => setForm({ ...form, lowOrderShippingCost: Number(e.target.value) })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="highOrderShippingCost">High Order Shipping Cost</Label>
                  <Input id="highOrderShippingCost" type="number" value={form.highOrderShippingCost} onChange={e => setForm({ ...form, highOrderShippingCost: Number(e.target.value) })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                  <Input id="freeShippingThreshold" type="number" value={form.freeShippingThreshold} onChange={e => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estimatedDeliveryDays">Estimated Delivery Days</Label>
                  <Input id="estimatedDeliveryDays" type="number" value={form.estimatedDeliveryDays} onChange={e => setForm({ ...form, estimatedDeliveryDays: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxDeliveryDistanceKm">Max Delivery Distance (Km)</Label>
                  <Input id="maxDeliveryDistanceKm" type="number" value={form.maxDeliveryDistanceKm} onChange={e => setForm({ ...form, maxDeliveryDistanceKm: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2 md:col-span-3">
                  <Label htmlFor="freeShippingDescription">Free Shipping Description</Label>
                  <Textarea id="freeShippingDescription" value={form.freeShippingDescription} onChange={e => setForm({ ...form, freeShippingDescription: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weekendSurcharge">Weekend Surcharge</Label>
                  <Input id="weekendSurcharge" type="number" value={form.weekendSurcharge ?? 0} onChange={e => setForm({ ...form, weekendSurcharge: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="holidaySurcharge">Holiday Surcharge</Label>
                  <Input id="holidaySurcharge" type="number" value={form.holidaySurcharge ?? 0} onChange={e => setForm({ ...form, holidaySurcharge: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rushDeliverySurcharge">Rush Delivery Surcharge</Label>
                  <Input id="rushDeliverySurcharge" type="number" value={form.rushDeliverySurcharge ?? 0} onChange={e => setForm({ ...form, rushDeliverySurcharge: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2 md:col-span-3">
                  <Label htmlFor="customerMessage">Customer Message</Label>
                  <Input id="customerMessage" value={form.customerMessage} onChange={e => setForm({ ...form, customerMessage: e.target.value })} />
                </div>
                <div className="grid gap-2 md:col-span-3">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea id="adminNotes" value={form.adminNotes} onChange={e => setForm({ ...form, adminNotes: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="freeShippingStartDate">Free Shipping Start</Label>
                  <Input id="freeShippingStartDate" type="datetime-local" value={form.freeShippingStartDate} onChange={e => setForm({ ...form, freeShippingStartDate: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="freeShippingEndDate">Free Shipping End</Label>
                  <Input id="freeShippingEndDate" type="datetime-local" value={form.freeShippingEndDate} onChange={e => setForm({ ...form, freeShippingEndDate: e.target.value })} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!form.enableFreeShippingEvents} onCheckedChange={v => setForm({ ...form, enableFreeShippingEvents: v })} />
                  <Label>Enable Free Shipping Events</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!form.isFreeShippingActive} onCheckedChange={v => setForm({ ...form, isFreeShippingActive: v })} />
                  <Label>Free Shipping Active</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!form.setAsDefault} onCheckedChange={v => setForm({ ...form, setAsDefault: v })} />
                  <Label>Set As Default</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? 'Creating...' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Configurations</CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between gap-4">
              <Input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
              <Badge variant="outline">{data?.length || 0} Total</Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Low Threshold</TableHead>
                  <TableHead>Low Cost</TableHead>
                  <TableHead>High Cost</TableHead>
                  <TableHead>Free Threshold</TableHead>
                  <TableHead>Est. Days</TableHead>
                  <TableHead>Max Distance</TableHead>
                  <TableHead>Free Events</TableHead>
                  <TableHead>Free Active</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list || []).map((cfg: any) => (
                  <TableRow key={cfg.id}>
                    <TableCell className="font-medium">{cfg.configurationName || cfg.name}</TableCell>
                    <TableCell>{cfg.lowOrderThreshold}</TableCell>
                    <TableCell>{cfg.lowOrderShippingCost}</TableCell>
                    <TableCell>{cfg.highOrderShippingCost}</TableCell>
                    <TableCell>{cfg.freeShippingThreshold}</TableCell>
                    <TableCell>{cfg.estimatedDeliveryDays}</TableCell>
                    <TableCell>{cfg.maxDeliveryDistanceKm}</TableCell>
                    <TableCell>
                      <Badge variant={cfg.enableFreeShippingEvents ? 'default' : 'secondary'}>{cfg.enableFreeShippingEvents ? 'Yes' : 'No'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.isFreeShippingActive ? 'default' : 'secondary'}>{cfg.isFreeShippingActive ? 'Yes' : 'No'}</Badge>
                    </TableCell>
                    <TableCell>
                      {cfg.isDefault ? (
                        <Badge variant="default" className="flex items-center gap-1"><Star className="w-3 h-3" /> Default</Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setDefaultMut.mutate(cfg.id)} disabled={setDefaultMut.isPending}>Set Default</Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">{cfg.createdAt}</div>
                      <div className="text-xs">{cfg.createdByUserName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600" onClick={() => onEdit(cfg)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600" onClick={() => softDeleteMut.mutate(cfg.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" onClick={() => hardDeleteMut.mutate(cfg.id)}>
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Shipping Threshold</DialogTitle>
              <DialogDescription>Update configuration details</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="grid gap-2 md:col-span-3">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lowOrderThreshold">Low Order Threshold</Label>
                <Input id="edit-lowOrderThreshold" type="number" value={form.lowOrderThreshold} onChange={e => setForm({ ...form, lowOrderThreshold: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lowOrderShippingCost">Low Order Shipping Cost</Label>
                <Input id="edit-lowOrderShippingCost" type="number" value={form.lowOrderShippingCost} onChange={e => setForm({ ...form, lowOrderShippingCost: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-highOrderShippingCost">High Order Shipping Cost</Label>
                <Input id="edit-highOrderShippingCost" type="number" value={form.highOrderShippingCost} onChange={e => setForm({ ...form, highOrderShippingCost: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-freeShippingThreshold">Free Shipping Threshold</Label>
                <Input id="edit-freeShippingThreshold" type="number" value={form.freeShippingThreshold} onChange={e => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-estimatedDeliveryDays">Estimated Delivery Days</Label>
                <Input id="edit-estimatedDeliveryDays" type="number" value={form.estimatedDeliveryDays} onChange={e => setForm({ ...form, estimatedDeliveryDays: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maxDeliveryDistanceKm">Max Delivery Distance (Km)</Label>
                <Input id="edit-maxDeliveryDistanceKm" type="number" value={form.maxDeliveryDistanceKm} onChange={e => setForm({ ...form, maxDeliveryDistanceKm: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2 md:col-span-3">
                <Label htmlFor="edit-freeShippingDescription">Free Shipping Description</Label>
                <Textarea id="edit-freeShippingDescription" value={form.freeShippingDescription} onChange={e => setForm({ ...form, freeShippingDescription: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-weekendSurcharge">Weekend Surcharge</Label>
                <Input id="edit-weekendSurcharge" type="number" value={form.weekendSurcharge ?? 0} onChange={e => setForm({ ...form, weekendSurcharge: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-holidaySurcharge">Holiday Surcharge</Label>
                <Input id="edit-holidaySurcharge" type="number" value={form.holidaySurcharge ?? 0} onChange={e => setForm({ ...form, holidaySurcharge: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-rushDeliverySurcharge">Rush Delivery Surcharge</Label>
                <Input id="edit-rushDeliverySurcharge" type="number" value={form.rushDeliverySurcharge ?? 0} onChange={e => setForm({ ...form, rushDeliverySurcharge: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2 md:col-span-3">
                <Label htmlFor="edit-customerMessage">Customer Message</Label>
                <Input id="edit-customerMessage" value={form.customerMessage} onChange={e => setForm({ ...form, customerMessage: e.target.value })} />
              </div>
              <div className="grid gap-2 md:col-span-3">
                <Label htmlFor="edit-adminNotes">Admin Notes</Label>
                <Textarea id="edit-adminNotes" value={form.adminNotes} onChange={e => setForm({ ...form, adminNotes: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-freeShippingStartDate">Free Shipping Start</Label>
                <Input id="edit-freeShippingStartDate" type="datetime-local" value={form.freeShippingStartDate} onChange={e => setForm({ ...form, freeShippingStartDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-freeShippingEndDate">Free Shipping End</Label>
                <Input id="edit-freeShippingEndDate" type="datetime-local" value={form.freeShippingEndDate} onChange={e => setForm({ ...form, freeShippingEndDate: e.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!form.enableFreeShippingEvents} onCheckedChange={v => setForm({ ...form, enableFreeShippingEvents: v })} />
                <Label>Enable Free Shipping Events</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!form.isFreeShippingActive} onCheckedChange={v => setForm({ ...form, isFreeShippingActive: v })} />
                <Label>Free Shipping Active</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!form.setAsDefault} onCheckedChange={v => setForm({ ...form, setAsDefault: v })} />
                <Label>Set As Default</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMut.isPending}>{updateMut.isPending ? 'Updating...' : 'Update'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShippingManagement;
