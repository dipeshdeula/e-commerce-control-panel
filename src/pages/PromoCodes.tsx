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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit, Plus, RotateCcw, Trash2, Power, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PromoCodeForm = {
  code: string;
  name: string;
  description?: string;
  type: number;
  discountValue: number;
  isActive: boolean;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxTotalUsage?: number;
  maxUsagePerUser?: number;
  startDateNepal?: string;
  endDateNepal?: string;
  applyToShipping?: boolean;
  stackableWithEvents?: boolean;
  customerTier?: string;
  adminNotes?: string;
};

const defaultForm: PromoCodeForm = {
  code: '',
  name: '',
  description: '',
  type: 0,
  discountValue: 0,
  isActive: false,
  maxDiscountAmount: undefined,
  minOrderAmount: undefined,
  maxTotalUsage: undefined,
  maxUsagePerUser: 1,
  startDateNepal: '',
  endDateNepal: '',
  applyToShipping: false,
  stackableWithEvents: false,
  customerTier: 'All',
  adminNotes: ''
};

const typeOptions = [
  { value: 0, label: 'Percentage' },
  { value: 1, label: 'Fixed Amount' },
  { value: 2, label: 'Free Shipping' },
  { value: 3, label: 'Buy X Get Y' }
];

const statusLabels: Record<number, string> = {
  0: 'Draft',
  1: 'Active',
  2: 'Expired',
  3: 'Suspended',
  4: 'Exhausted'
};

// Helpers for datetime-local formatting (Nepal time)
const pad = (n: number) => n.toString().padStart(2, '0');
const toNepalNow = (): string => {
  const now = new Date();
  // Convert to UTC then apply Nepal offset (+5:45 => 345 minutes)
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalMs = utcMs + 345 * 60000;
  const d = new Date(nepalMs);
  const s = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return s;
};
const toDatetimeLocalInput = (value?: string, fallbackToNowNepal: boolean = false): string => {
  if (!value || value.trim() === '') {
    return fallbackToNowNepal ? toNepalNow() : '';
  }
  // Normalize various formats to yyyy-MM-ddTHH:mm
  let v = value.trim();
  v = v.replace(' ', 'T');
  if (v.includes('.')) v = v.split('.')[0];
  if (v.endsWith('Z')) v = v.slice(0, -1);
  // Keep only yyyy-MM-ddTHH:mm
  if (v.length >= 16) v = v.slice(0, 16);
  return v;
};

export const PromoCodes: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<PromoCodeForm>({ ...defaultForm });

  const { data, isLoading } = useQuery({
    queryKey: ['promoCodes'],
    queryFn: async () => {
      const res = await apiService.getAllPromoCodes();
      if (!res.success) throw new Error(res.message || 'Failed to load promo codes');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      return list as any[];
    }
  });

  const createMut = useMutation({
    mutationFn: async (payload: PromoCodeForm) => {
      const res = await apiService.createPromoCode(payload as any);
      if (!res.success) throw new Error(res.message || 'Failed to create');
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promoCodes'] });
      setCreateOpen(false);
      setForm({ ...defaultForm });
      toast({ title: 'Promo code created' });
    },
    onError: (e: any) => toast({ title: 'Create failed', description: e.message, variant: 'destructive' })
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<PromoCodeForm> }) => {
      const res = await apiService.updatePromoCode(id, payload as any);
      if (!res.success) throw new Error(res.message || 'Failed to update');
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promoCodes'] });
      setEditOpen(false);
      setSelected(null);
      toast({ title: 'Promo code updated' });
    },
    onError: (e: any) => toast({ title: 'Update failed', description: e.message, variant: 'destructive' })
  });

  const activateMut = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const res = active ? await apiService.activatePromoCode(id) : await apiService.deactivatePromoCode(id);
      if (!res.success) throw new Error(res.message || 'Failed to toggle active');
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promoCodes'] });
      toast({ title: 'Status updated' });
    },
    onError: (e: any) => toast({ title: 'Status update failed', description: e.message, variant: 'destructive' })
  });

  const softDeleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiService.softDeletePromoCode(id);
      if (!res.success) throw new Error(res.message || 'Failed to delete');
      return res;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promoCodes'] }); toast({ title: 'Moved to trash' }); },
    onError: (e: any) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' })
  });

  const unDeleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiService.unDeletePromoCode(id);
      if (!res.success) throw new Error(res.message || 'Failed to restore');
      return res;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promoCodes'] }); toast({ title: 'Restored' }); },
    onError: (e: any) => toast({ title: 'Restore failed', description: e.message, variant: 'destructive' })
  });

  const hardDeleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiService.hardDeletePromoCode(id);
      if (!res.success) throw new Error(res.message || 'Failed to permanently delete');
      return res;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promoCodes'] }); toast({ title: 'Permanently deleted' }); },
    onError: (e: any) => toast({ title: 'Permanent delete failed', description: e.message, variant: 'destructive' })
  });

  const list = useMemo(() => (data || []).filter((p: any) => {
    const t = search.toLowerCase();
    return (
      p.code?.toLowerCase().includes(t) ||
      p.name?.toLowerCase().includes(t)
    );
  }), [data, search]);

  const onEdit = (item: any) => {
    setSelected(item);
    setForm({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
      type: item.type ?? 0,
      discountValue: item.discountValue ?? 0,
      isActive: !!item.isActive,
      maxDiscountAmount: item.maxDiscountAmount,
      minOrderAmount: item.minOrderAmount,
      maxTotalUsage: item.maxTotalUsage,
      maxUsagePerUser: item.maxUsagePerUser ?? 1,
  startDateNepal: toDatetimeLocalInput(item.startDateNepal, true),
  endDateNepal: toDatetimeLocalInput(item.endDateNepal, true),
      applyToShipping: !!item.applyToShipping,
      stackableWithEvents: !!item.stackableWithEvents,
      customerTier: item.customerTier || 'All',
      adminNotes: item.adminNotes || ''
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
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
            <p className="text-gray-600">Create and manage promo codes</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setSelected(null); setForm({ ...defaultForm, startDateNepal: toDatetimeLocalInput('', true), endDateNepal: toDatetimeLocalInput('', true) }); }}>
                <Plus className="w-4 h-4 mr-2" />
                New Promo Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <form onSubmit={onSubmit}>
                <DialogHeader>
                  <DialogTitle>Create Promo Code</DialogTitle>
                  <DialogDescription>Fill the fields and submit</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={form.type.toString()} onValueChange={v => setForm({ ...form, type: parseInt(v) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map(o => <SelectItem key={o.value} value={o.value.toString()}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discountValue">Discount Value</Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={form.discountValue}
                      onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
                      required={form.type !== 2}
                      disabled={form.type === 2}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxDiscountAmount">Max Discount Amount</Label>
                    <Input id="maxDiscountAmount" type="number" value={form.maxDiscountAmount ?? ''} onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minOrderAmount">Min Order Amount</Label>
                    <Input id="minOrderAmount" type="number" value={form.minOrderAmount ?? ''} onChange={e => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxTotalUsage">Max Total Usage</Label>
                    <Input id="maxTotalUsage" type="number" value={form.maxTotalUsage ?? ''} onChange={e => setForm({ ...form, maxTotalUsage: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxUsagePerUser">Max Usage Per User</Label>
                    <Input id="maxUsagePerUser" type="number" value={form.maxUsagePerUser ?? 1} onChange={e => setForm({ ...form, maxUsagePerUser: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startDateNepal">Start Date (Nepal)</Label>
                    <Input
                      id="startDateNepal"
                      type="datetime-local"
                      value={form.startDateNepal}
                      onChange={e => setForm({ ...form, startDateNepal: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDateNepal">End Date (Nepal)</Label>
                    <Input
                      id="endDateNepal"
                      type="datetime-local"
                      value={form.endDateNepal}
                      onChange={e => setForm({ ...form, endDateNepal: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={!!form.applyToShipping} onCheckedChange={v => setForm({ ...form, applyToShipping: v })} />
                    <Label>Apply To Shipping</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={!!form.stackableWithEvents} onCheckedChange={v => setForm({ ...form, stackableWithEvents: v })} />
                    <Label>Stackable With Events</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customerTier">Customer Tier</Label>
                    <Input id="customerTier" value={form.customerTier} onChange={e => setForm({ ...form, customerTier: e.target.value })} />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="adminNotes">Admin Notes</Label>
                    <Textarea id="adminNotes" value={form.adminNotes} onChange={e => setForm({ ...form, adminNotes: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <Switch checked={!!form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
                    <Label>Start as Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? 'Creating...' : 'Create Promo Code'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Promo Code List</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-between gap-4">
                <Input placeholder="Search by code or name..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
                <Badge variant="outline">{data?.length || 0} Total</Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Max Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="min-w-[320px]">Validity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list || []).map((pc: any) => (
                  <TableRow key={pc.id} className={pc.isDeleted ? 'opacity-60 bg-red-50' : ''}>
                    <TableCell className="font-medium">{pc.code}</TableCell>
                    <TableCell>{pc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pc.formattedDiscount || (pc.type === 0 ? `${pc.discountValue}%` : `Rs.${pc.discountValue}`)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{pc.maxDiscountAmount ?? '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{pc.minOrderAmount ?? '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pc.isActive ? 'default' : 'secondary'}>
                        {typeof pc.status === 'number' ? (statusLabels[pc.status] || 'Unknown') : (pc.isActive ? 'Active' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{pc.currentUsageCount ?? 0} / {pc.maxTotalUsage ?? '∞'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground whitespace-normal break-words">
                        {pc.formattedValidPeriod ? (
                          <span>{pc.formattedValidPeriod}</span>
                        ) : (
                          <div className="space-y-0.5">
                            <div><span className="font-medium text-gray-700">Start:</span> {pc.formattedStartDate || pc.startDateNepal || '-'}</div>
                            <div><span className="font-medium text-gray-700">End:</span> {pc.formattedEndDate || pc.endDateNepal || '-'}</div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600" onClick={() => onEdit(pc)} disabled={pc.isDeleted}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-600" onClick={() => activateMut.mutate({ id: pc.id, active: !pc.isActive })}>
                              <AlertTriangle className="hidden" />
                              <Power className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{pc.isActive ? 'Deactivate' : 'Activate'}</TooltipContent>
                        </Tooltip>

                        {!pc.isDeleted ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600" onClick={() => softDeleteMut.mutate(pc.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Soft Delete</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600" onClick={() => unDeleteMut.mutate(pc.id)}>
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Restore</TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" onClick={() => hardDeleteMut.mutate(pc.id)}>
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Hard Delete</TooltipContent>
                        </Tooltip>
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <form onSubmit={onSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Promo Code</DialogTitle>
                <DialogDescription>Update promo code details</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-code">Code</Label>
                  <Input id="edit-code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input id="edit-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={form.type.toString()} onValueChange={v => setForm({ ...form, type: parseInt(v) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(o => <SelectItem key={o.value} value={o.value.toString()}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-discountValue">Discount Value</Label>
                  <Input
                    id="edit-discountValue"
                    type="number"
                    value={form.discountValue}
                    onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
                    required={form.type !== 2}
                    disabled={form.type === 2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxDiscountAmount">Max Discount Amount</Label>
                  <Input id="edit-maxDiscountAmount" type="number" value={form.maxDiscountAmount ?? ''} onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-minOrderAmount">Min Order Amount</Label>
                  <Input id="edit-minOrderAmount" type="number" value={form.minOrderAmount ?? ''} onChange={e => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxTotalUsage">Max Total Usage</Label>
                  <Input id="edit-maxTotalUsage" type="number" value={form.maxTotalUsage ?? ''} onChange={e => setForm({ ...form, maxTotalUsage: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxUsagePerUser">Max Usage Per User</Label>
                  <Input id="edit-maxUsagePerUser" type="number" value={form.maxUsagePerUser ?? 1} onChange={e => setForm({ ...form, maxUsagePerUser: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-startDateNepal">Start Date (Nepal)</Label>
                  <Input
                    id="edit-startDateNepal"
                    type="datetime-local"
                    value={form.startDateNepal}
                    onChange={e => setForm({ ...form, startDateNepal: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-endDateNepal">End Date (Nepal)</Label>
                  <Input
                    id="edit-endDateNepal"
                    type="datetime-local"
                    value={form.endDateNepal}
                    onChange={e => setForm({ ...form, endDateNepal: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!form.applyToShipping} onCheckedChange={v => setForm({ ...form, applyToShipping: v })} />
                  <Label>Apply To Shipping</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!form.stackableWithEvents} onCheckedChange={v => setForm({ ...form, stackableWithEvents: v })} />
                  <Label>Stackable With Events</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-customerTier">Customer Tier</Label>
                  <Input id="edit-customerTier" value={form.customerTier} onChange={e => setForm({ ...form, customerTier: e.target.value })} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="edit-adminNotes">Admin Notes</Label>
                  <Textarea id="edit-adminNotes" value={form.adminNotes} onChange={e => setForm({ ...form, adminNotes: e.target.value })} />
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <Switch checked={!!form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
                  <Label>Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMut.isPending}>{updateMut.isPending ? 'Updating...' : 'Update Promo Code'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PromoCodes;
