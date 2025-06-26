
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  CreditCard
} from 'lucide-react';

const BASE_URL = 'http://110.34.2.30:5013';

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
    registeredVatNumber: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    websiteUrl: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => apiService.getAllCompanyInfo(1, 10),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createCompanyInfo({
      ...data,
      createdAt: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'Company information created successfully',
        className: 'bg-green-50 border-green-200 text-green-800'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create company info',
        variant: 'destructive'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiService.updateCompanyInfo(id, {
        ...data,
        updatedAt: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      setIsEditOpen(false);
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'Company information updated successfully',
        className: 'bg-blue-50 border-blue-200 text-blue-800'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update company info',
        variant: 'destructive'
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      return apiService.uploadCompanyLogo(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      toast({ 
        title: 'Success', 
        description: 'Company logo updated successfully',
        className: 'bg-blue-50 border-blue-200 text-blue-800'
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteCompanyInfo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      toast({ 
        title: 'Success', 
        description: 'Company information deleted successfully',
        className: 'bg-red-50 border-red-200 text-red-800'
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      contact: '',
      registrationNumber: '',
      registeredPanNumber: '',
      registeredVatNumber: '',
      street: '',
      city: '',
      province: '',
      postalCode: '',
      websiteUrl: '',
    });
    setLogoFile(null);
    setSelectedCompany(null);
  };

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      contact: company.contact,
      registrationNumber: company.registrationNumber,
      registeredPanNumber: company.registeredPanNumber,
      registeredVatNumber: company.registeredVatNumber,
      street: company.street,
      city: company.city,
      province: company.province,
      postalCode: company.postalCode,
      websiteUrl: company.websiteUrl,
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent, isEdit: boolean = false) => {
    e.preventDefault();
    
    if (isEdit && selectedCompany) {
      updateMutation.mutate({ id: selectedCompany.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleLogoUpload = (companyId: number) => {
    if (logoFile) {
      uploadLogoMutation.mutate({ id: companyId, file: logoFile });
      setLogoFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading company information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Information</h1>
          <p className="text-gray-600 mt-1">Manage your business details and company profile</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => resetForm()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={(e) => handleSubmit(e, false)}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-500" />
                    Add Company Information
                  </DialogTitle>
                  <DialogDescription>
                    Enter your company details and business information
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="InstantMart"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@instantmart.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contact">Contact Number</Label>
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="+977-9741569852"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="websiteUrl">Website URL</Label>
                      <Input
                        id="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        placeholder="www.instantmart.com"
                      />
                    </div>
                  </div>

                  {/* Registration Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="registrationNumber">Registration No.</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        placeholder="7788996655"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="registeredPanNumber">PAN Number</Label>
                      <Input
                        id="registeredPanNumber"
                        value={formData.registeredPanNumber}
                        onChange={(e) => setFormData({ ...formData, registeredPanNumber: e.target.value })}
                        placeholder="1122336655"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="registeredVatNumber">VAT Number</Label>
                      <Input
                        id="registeredVatNumber"
                        value={formData.registeredVatNumber}
                        onChange={(e) => setFormData({ ...formData, registeredVatNumber: e.target.value })}
                        placeholder="774411225"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid gap-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Surya Chowk"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Hetauda"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        placeholder="Bagmati"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="44700"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
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

      <div className="grid gap-6">
        {companies?.data?.map((company: any) => (
          <Card key={company.id} className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                    {company.logoUrl ? (
                      <img 
                        src={`${BASE_URL}/${company.logoUrl}`} 
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{company.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        ID: {company.id}
                      </Badge>
                      <span className="text-gray-500">
                        Created: {new Date(company.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(company)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteMutation.mutate(company.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{company.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{company.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{company.websiteUrl}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Address
                </h3>
                <p className="text-gray-600">
                  {company.street}, {company.city}, {company.province} {company.postalCode}
                </p>
              </div>

              {/* Registration Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Registration Details
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Registration No.</span>
                    <p className="font-medium">{company.registrationNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">PAN Number</span>
                    <p className="font-medium">{company.registeredPanNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">VAT Number</span>
                    <p className="font-medium">{company.registeredVatNumber}</p>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  Logo Upload
                </h3>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="max-w-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Button 
                    onClick={() => handleLogoUpload(company.id)}
                    disabled={!logoFile || uploadLogoMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!companies?.data || companies.data.length === 0) && (
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="text-center py-12">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Company Information</h3>
              <p className="text-gray-500 mb-4">Get started by adding your company details</p>
              <Button 
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Company Information
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={(e) => handleSubmit(e, true)}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" />
                Edit Company Information
              </DialogTitle>
              <DialogDescription>
                Update your company details and business information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Company Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-contact">Contact Number</Label>
                  <Input
                    id="edit-contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-websiteUrl">Website URL</Label>
                  <Input
                    id="edit-websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Registration Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-registrationNumber">Registration No.</Label>
                  <Input
                    id="edit-registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-registeredPanNumber">PAN Number</Label>
                  <Input
                    id="edit-registeredPanNumber"
                    value={formData.registeredPanNumber}
                    onChange={(e) => setFormData({ ...formData, registeredPanNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-registeredVatNumber">VAT Number</Label>
                  <Input
                    id="edit-registeredVatNumber"
                    value={formData.registeredVatNumber}
                    onChange={(e) => setFormData({ ...formData, registeredVatNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid gap-2">
                <Label htmlFor="edit-street">Street Address</Label>
                <Input
                  id="edit-street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-province">Province</Label>
                  <Input
                    id="edit-province"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-postalCode">Postal Code</Label>
                  <Input
                    id="edit-postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
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
