import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Building,
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  CreditCard,
  Undo
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api.config';


export const CompanyInfo: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    registrationNumber: '',
    registeredPanNumber: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    websiteUrl: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => apiService.getAllCompanyInfo(1, 10),
  });

  // Debug log to see the actual structure
  console.log('Companies data structure:', companies);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createCompanyInfo({
      ...data,
      createdAt: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      setIsCreateOpen(false);
      setFormData({
        name: '',
        email: '',
        contact: '',
        registrationNumber: '',
        registeredPanNumber: '',
        street: '',
        city: '',
        province: '',
        postalCode: '',
        websiteUrl: ''
      });
      toast({
        title: "Success",
        description: "Company information created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company information",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiService.updateCompanyInfo(selectedCompany.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      setIsEditOpen(false);
      setSelectedCompany(null);
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company information",
        variant: "destructive",
      });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteCompanyInfo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      toast({
        title: "Success",
        description: "Company information deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company information",
        variant: "destructive",
      });
    },
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteCompanyInfo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      toast({
        title: "Success",
        description: "Company information restored successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore company information",
        variant: "destructive",
      });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteCompanyInfo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      toast({
        title: "Success",
        description: "Company information permanently deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to permanently delete company information",
        variant: "destructive",
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: ({ companyId, file }: { companyId: number; file: File }) => 
      apiService.uploadCompanyLogo(companyId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      setLogoFile(null);
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent, isEdit = false) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleLogoUpload = (companyId: number) => {
    if (logoFile) {
      uploadLogoMutation.mutate({ companyId, file: logoFile });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Information</h1>
          <p className="text-gray-600">Manage your company details and information</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={(e) => handleSubmit(e, false)}>
                <DialogHeader>
                  <DialogTitle>Add Company Information</DialogTitle>
                  <DialogDescription>
                    Fill in the company details below
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact *</Label>
                      <Input
                        id="contact"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website URL</Label>
                      <Input
                        id="websiteUrl"
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number *</Label>
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registeredPanNumber">PAN / VAT Number *</Label>
                      <Input
                        id="registeredPanNumber"
                        name="registeredPanNumber"
                        value={formData.registeredPanNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>                   
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Company
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Manage company information and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading companies...</span>
            </div>
          ) : companies?.data?.data && Array.isArray(companies.data.data) && companies.data.data.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-16">Logo</TableHead>
                    <TableHead className="min-w-48">Company Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.data.data.map((company: any) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                          {company.logoUrl ? (
                            <img 
                              src={`${API_BASE_URL}/${company.logoUrl}`} 
                              alt={company.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          {company.websiteUrl && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Globe className="w-3 h-3" />
                              <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {company.websiteUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {company.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {company.contact}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {company.street}, {company.city}
                          </div>
                          <div className="text-sm text-gray-500">
                            {company.province} - {company.postalCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Reg:</span> {company.registrationNumber}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <CreditCard className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">PAN:</span> {company.registeredPanNumber}
                          </div>                          
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.isDeleted ? "destructive" : "default"}>
                          {company.isDeleted ? "Deleted" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCompany(company);
                              setFormData({
                                name: company.name,
                                email: company.email,
                                contact: company.contact,
                                registrationNumber: company.registrationNumber,
                                registeredPanNumber: company.registeredPanNumber,
                                street: company.street,
                                city: company.city,
                                province: company.province,
                                postalCode: company.postalCode,
                                websiteUrl: company.websiteUrl || ''
                              });
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          {company.isDeleted ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unDeleteMutation.mutate(company.id)}
                              disabled={unDeleteMutation.isPending}
                            >
                              <Undo className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => softDeleteMutation.mutate(company.id)}
                              disabled={softDeleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => hardDeleteMutation.mutate(company.id)}
                            disabled={hardDeleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first company.</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Company
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={(e) => handleSubmit(e, true)}>
            <DialogHeader>
              <DialogTitle>Edit Company Information</DialogTitle>
              <DialogDescription>
                Update the company details below
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Company Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contact">Contact *</Label>
                  <Input
                    id="edit-contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-websiteUrl">Website URL</Label>
                  <Input
                    id="edit-websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-street">Street Address *</Label>
                <Input
                  id="edit-street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City *</Label>
                  <Input
                    id="edit-city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-province">Province *</Label>
                  <Input
                    id="edit-province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-postalCode">Postal Code *</Label>
                  <Input
                    id="edit-postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-registrationNumber">Registration Number *</Label>
                  <Input
                    id="edit-registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-registeredPanNumber">PAN / VAT Number *</Label>
                  <Input
                    id="edit-registeredPanNumber"
                    name="registeredPanNumber"
                    value={formData.registeredPanNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>               
              </div>

              {selectedCompany && (
                <div className="space-y-2">
                  <Label htmlFor="logo">Upload Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  {logoFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogoUpload(selectedCompany.id)}
                      disabled={uploadLogoMutation.isPending}
                    >
                      {uploadLogoMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Company
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
