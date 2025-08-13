import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceAreaService, ServiceAreaDTO } from '@/services/service-area-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { NEPAL_PROVINCES, getCitiesByProvince } from '@/constants/nepal-locations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaultForm: ServiceAreaDTO = {
  cityName: '',
  province: '',
  country: 'Nepal',
  centerLatitude: 0,
  centerLongitude: 0,
  displayName: '',
  description: '',
  notAvailableMessage: '',
  isActive: true,
  isComingSoon: false,
  radiusKm: 0,
  deliveryStartTime: '08:00:00',
  deliveryEndTime: '20:00:00',
  estimatedDeliveryDays: 1,
  minOrderAmount: 0,
  maxDeliveryDistancekm: 0
};

export const ServiceArea: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<ServiceAreaDTO>({ ...defaultForm });
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<ServiceAreaDTO | null>(null);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const[currentPage,setCurrentPage] = useState(1);
  const[pageSize,setPageSize] = useState(10);
  const[goToPage,setGoToPage] = useState('');
  const[citySearch,setCitySearch] = useState('');
  const[provinceSearch,setProvinceSearch] = useState('');

  //Debounce search term
  useEffect(()=>{
    const timer = setTimeout(()=>{
        setDebouncedSearchTerm(searchTerm);
    },500);

    return () => clearTimeout(timer);
  },[searchTerm])

  // Reset to first page when search term or page size changes
  useEffect(()=>{
    setCurrentPage(1);
  },[debouncedSearchTerm,pageSize]);


  const { data, isLoading, refetch } = useQuery({
    queryKey: ['serviceAreas', currentPage, pageSize, debouncedSearchTerm, isActiveFilter],
    queryFn: async () => {
      const params: any = { page: currentPage, pageSize };
      if (isActiveFilter === 'true') params.activeOnly = true;
      if (isActiveFilter === 'false') params.activeOnly = false;
      return await serviceAreaService.getServiceAreas(params);
    }
  });

  const createMut = useMutation({
    mutationFn: async (payload: ServiceAreaDTO) => {
      const res = await serviceAreaService.createServiceArea(payload);
      if (!res.success) throw new Error(res.message || 'Failed to create');
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['serviceAreas'] });
      setCreateOpen(false);
      setForm({ ...defaultForm });
      toast({ title: 'Service area created' });
    },
    onError: (e: any) => toast({ title: 'Create failed', description: e.message, variant: 'destructive' })
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ServiceAreaDTO }) => {
      const res = await serviceAreaService.updateServiceArea(id, payload);
      if (!res.success) throw new Error(res.message || 'Failed to update');
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['serviceAreas'] });
      setEditOpen(false);
      setSelected(null);
      toast({ title: 'Service area updated' });
    },
    onError: (e: any) => toast({ title: 'Update failed', description: e.message, variant: 'destructive' })
  });

  const hardDeleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await serviceAreaService.hardDeleteServiceArea(id);
      if (!res.success) throw new Error(res.message || 'Failed to delete');
      return res;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['serviceAreas'] }); toast({ title: 'Deleted' }); },
    onError: (e: any) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' })
  });



  const onEdit = (item: ServiceAreaDTO) => {
    setSelected(item);
    setForm({ ...item });
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

  // Fix pagination logic to use backend pagination
  const pagedList = data?.data || [];
  const totalCount = data?.pagination?.totalCount || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const hasNextPage = data?.pagination?.hasNextPage || false;
  const hasPreviousPage = data?.pagination?.hasPreviousPage || false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Service Areas</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelected(null); setForm({ ...defaultForm }); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Service Area
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <form onSubmit={onSubmit}>
              <DialogHeader>
                <DialogTitle>Create Service Area</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="province">Province</Label>
                  <Select value={form.province} onValueChange={v => setForm({ ...form, province: v, cityName: '' })}>
                    <SelectTrigger id="province">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {NEPAL_PROVINCES.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="cityName">City Name</Label>
                  <Select value={form.cityName} onValueChange={v => setForm({ ...form, cityName: v })} disabled={!form.province}>
                    <SelectTrigger id="cityName">
                      <SelectValue placeholder={form.province ? 'Select city' : 'Select province first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {getCitiesByProvince(form.province).map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label} ({form.province})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="centerLatitude">Center Latitude</Label>
                  <Input id="centerLatitude" type="number" value={form.centerLatitude} onChange={e => setForm({ ...form, centerLatitude: Number(e.target.value) })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="centerLongitude">Center Longitude</Label>
                  <Input id="centerLongitude" type="number" value={form.centerLongitude} onChange={e => setForm({ ...form, centerLongitude: Number(e.target.value) })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="notAvailableMessage">Not Available Message</Label>
                  <Input id="notAvailableMessage" value={form.notAvailableMessage} onChange={e => setForm({ ...form, notAvailableMessage: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="radiusKm">Radius (km)</Label>
                  <Input id="radiusKm" type="number" value={form.radiusKm} onChange={e => setForm({ ...form, radiusKm: Number(e.target.value) })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deliveryStartTime">Delivery Start Time</Label>
                  <Input id="deliveryStartTime" type="time" value={form.deliveryStartTime} onChange={e => setForm({ ...form, deliveryStartTime: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deliveryEndTime">Delivery End Time</Label>
                  <Input id="deliveryEndTime" type="time" value={form.deliveryEndTime} onChange={e => setForm({ ...form, deliveryEndTime: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estimatedDeliveryDays">Estimated Delivery Days</Label>
                  <Input id="estimatedDeliveryDays" type="number" value={form.estimatedDeliveryDays} onChange={e => setForm({ ...form, estimatedDeliveryDays: Number(e.target.value) })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minOrderAmount">Min Order Amount</Label>
                  <Input id="minOrderAmount" type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: Number(e.target.value) })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxDeliveryDistancekm">Max Delivery Distance (km)</Label>
                  <Input id="maxDeliveryDistancekm" type="number" value={form.maxDeliveryDistancekm} onChange={e => setForm({ ...form, maxDeliveryDistancekm: Number(e.target.value) })} required />
                </div>
                <div className="flex items-center gap-2">
                  <input id="isActive" type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="isComingSoon" type="checkbox" checked={form.isComingSoon} onChange={e => setForm({ ...form, isComingSoon: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                  <Label htmlFor="isComingSoon">Coming Soon</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? 'Creating...' : 'Create Service Area'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Area List</CardTitle>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 items-center">
              <Label htmlFor="isActiveFilter">Active Filter:</Label>
              <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-center">
              <span>Show:</span>
              <Select value={pageSize.toString()} onValueChange={v => setPageSize(Number(v))}>
                <SelectTrigger className="w-16">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {[5,10, 20, 50, 100].map(size => (
                    <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Radius (km)</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedList.map((sa: ServiceAreaDTO) => (
                  <TableRow key={sa.id}>
                    <TableCell>{sa.id}</TableCell>
                    <TableCell>{sa.displayName}</TableCell>
                    <TableCell>{sa.cityName}</TableCell>
                    <TableCell>{sa.province}</TableCell>
                    <TableCell>{sa.country}</TableCell>
                    <TableCell>{sa.radiusKm}</TableCell>
                    <TableCell>{sa.deliveryStartTime} - {sa.deliveryEndTime}</TableCell>
                    <TableCell>{sa.minOrderAmount}</TableCell>
                    <TableCell>{sa.isActive ? 'Active' : sa.isComingSoon ? 'Coming Soon' : 'Inactive'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => onEdit(sa)} className="mr-2"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => hardDeleteMut.mutate(sa.id!)} className="mr-2"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{pagedList.length ? ((currentPage - 1) * pageSize + 1) : 0}</span> to{' '}
              <span className="font-medium">{pagedList.length ? ((currentPage - 1) * pageSize + pagedList.length) : 0}</span> of{' '}
              <span className="font-medium">{totalCount}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={goToPage}
                onChange={e => setGoToPage(e.target.value)}
                className="w-16 h-8 text-center"
                placeholder={`${currentPage}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const page = Number(goToPage);
                  if (page >= 1 && page <= totalPages) setCurrentPage(page);
                }}
                disabled={!goToPage || Number(goToPage) < 1 || Number(goToPage) > totalPages}
              >Go</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!hasPreviousPage}
              >
                Previous
              </Button>
              <span>{currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Service Area</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Same fields as create */}
              <div className="grid gap-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input id="edit-country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="edit-province">Province</Label>
                <Select value={form.province} onValueChange={v => setForm({ ...form, province: v, cityName: '' })}>
                  <SelectTrigger id="edit-province">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {NEPAL_PROVINCES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="edit-cityName">City Name</Label>
                <Select value={form.cityName} onValueChange={v => setForm({ ...form, cityName: v })} disabled={!form.province}>
                  <SelectTrigger id="edit-cityName">
                    <SelectValue placeholder={form.province ? 'Select city' : 'Select province first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {getCitiesByProvince(form.province).map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label} ({form.province})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-centerLatitude">Center Latitude</Label>
                <Input id="edit-centerLatitude" type="number" value={form.centerLatitude} onChange={e => setForm({ ...form, centerLatitude: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-centerLongitude">Center Longitude</Label>
                <Input id="edit-centerLongitude" type="number" value={form.centerLongitude} onChange={e => setForm({ ...form, centerLongitude: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-displayName">Display Name</Label>
                <Input id="edit-displayName" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input id="edit-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="edit-notAvailableMessage">Not Available Message</Label>
                <Input id="edit-notAvailableMessage" value={form.notAvailableMessage} onChange={e => setForm({ ...form, notAvailableMessage: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-radiusKm">Radius (km)</Label>
                <Input id="edit-radiusKm" type="number" value={form.radiusKm} onChange={e => setForm({ ...form, radiusKm: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-deliveryStartTime">Delivery Start Time</Label>
                <Input id="edit-deliveryStartTime" type="time" value={form.deliveryStartTime} onChange={e => setForm({ ...form, deliveryStartTime: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-deliveryEndTime">Delivery End Time</Label>
                <Input id="edit-deliveryEndTime" type="time" value={form.deliveryEndTime} onChange={e => setForm({ ...form, deliveryEndTime: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-estimatedDeliveryDays">Estimated Delivery Days</Label>
                <Input id="edit-estimatedDeliveryDays" type="number" value={form.estimatedDeliveryDays} onChange={e => setForm({ ...form, estimatedDeliveryDays: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-minOrderAmount">Min Order Amount</Label>
                <Input id="edit-minOrderAmount" type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maxDeliveryDistancekm">Max Delivery Distance (km)</Label>
                <Input id="edit-maxDeliveryDistancekm" type="number" value={form.maxDeliveryDistancekm} onChange={e => setForm({ ...form, maxDeliveryDistancekm: Number(e.target.value) })} required />
              </div>
              <div className="flex items-center gap-2">
                <input id="edit-isActive" type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <input id="edit-isComingSoon" type="checkbox" checked={form.isComingSoon} onChange={e => setForm({ ...form, isComingSoon: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                <Label htmlFor="edit-isComingSoon">Coming Soon</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMut.isPending}>{updateMut.isPending ? 'Updating...' : 'Update Service Area'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceArea;
