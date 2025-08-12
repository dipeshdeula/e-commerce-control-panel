import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarIcon, Clock, Tag, Percent, DollarSign, Eye, Edit, Trash2, Play, Pause, Upload, BarChart3, Plus, Filter, Search, RefreshCw, Settings, Users, TrendingUp, Target, Calendar as CalendarIcon2, Zap, Gift, Star, Globe, CreditCard, Package } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { BannerEvent, CreateBannerEventDTO, BannerEventRule, BannerEventService } from '@/services/banner-event-service';
import BannerEventAnalyticsDashboard from '../components/banner-events/BannerEventAnalyticsDashboard';
import { ProductPricingAnalysis } from '@/components/banner-events/ProductPricingAnalysis';
import { BannerImageUpload } from '@/components/banner-events/BannerImageUpload';

// Enum mappings
const EventStatus = {
  0: 'Draft',
  1: 'Scheduled', 
  2: 'Active',
  3: 'Paused',
  4: 'Expired',
  5: 'Cancelled'
};

const EventType = {
  0: 'Seasonal',
  1: 'Festive', 
  2: 'Flash',
  3: 'Clearance',
  4: 'Launch',
  5: 'Loyalty'
};

const PromotionType = {
  0: 'Percentage',
  1: 'FixedAmount',
  2: 'BuyOneGetOne',
  3: 'FreeShipping',
  4: 'Bundle'
};

const RuleType = {
  0: 'Category',
  1: 'SubCategory',
  2: 'SubSubCategory',
  3: 'Product',
  4: 'PriceRange',
  5: 'Geography',
  6: 'PaymentMethod',
  7: 'All'
};

const getStatusBadgeVariant = (status: number) => {
  switch (status) {
    case 0: return 'secondary'; // Draft
    case 1: return 'default'; // Scheduled
    case 2: return 'default'; // Active
    case 3: return 'destructive'; // Paused
    case 4: return 'outline'; // Expired
    case 5: return 'destructive'; // Cancelled
    default: return 'secondary';
  }
};

const getEventTypeIcon = (eventType: number) => {
  switch (eventType) {
    case 0: return <Calendar className="h-4 w-4" />; // Seasonal
    case 1: return <Star className="h-4 w-4" />; // Festive
    case 2: return <Zap className="h-4 w-4" />; // Flash
    case 3: return <Package className="h-4 w-4" />; // Clearance
    case 4: return <TrendingUp className="h-4 w-4" />; // Launch
    case 5: return <Users className="h-4 w-4" />; // Loyalty
    default: return <Tag className="h-4 w-4" />;
  }
};

// Event Analytics Component
const EventAnalyticsView: React.FC<{ event: BannerEvent }> = ({ event }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Create banner event service instance
  const bannerEventService = React.useMemo(() => new BannerEventService(), []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const result = await bannerEventService.getEventAnalytics(event.id);
        console.log('Analytics result:', result);
        setAnalyticsData(result.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Set mock data based on event data for demonstration
        setAnalyticsData({
          performanceMetrics: {
            totalUsage: event.currentUsageCount,
            usageRate: (event.currentUsageCount / (event.maxUsageCount || 500)) * 100,
            products: event.totalProductsCount,
            rules: event.totalRulesCount
          },
          timeAnalysis: {
            daysRemaining: event.daysRemaining,
            currentlyActive: event.isCurrentlyActive,
            expired: event.isExpired
          },
          eventPerformanceSummary: {
            totalOriginalValue: event.eventProducts?.reduce((sum, p) => sum + (p.marketPrice || 0), 0) || 580,
            totalEffectiveValue: event.eventProducts?.reduce((sum, p) => sum + (p.calculatedDiscountPrice || p.marketPrice || 0), 0) || 0,
            totalCustomerSavings: event.eventProducts?.reduce((sum, p) => sum + (p.totalSavingsAmount || 0), 0) || 0
          },
          productBreakdown: event.eventProducts || []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [event.id, bannerEventService]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { performanceMetrics, timeAnalysis, eventPerformanceSummary, productBreakdown } = analyticsData || {};

  return (
    <div className="space-y-6">
      {/* Performance Metrics & Time Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Usage:</span>
              <span className="text-sm font-medium">{performanceMetrics?.totalUsage || event.currentUsageCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Usage Rate:</span>
              <span className="text-sm font-medium">{performanceMetrics?.usageRate?.toFixed(1) || event.usagePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Products:</span>
              <span className="text-sm font-medium">{performanceMetrics?.products || event.totalProductsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rules:</span>
              <span className="text-sm font-medium">{performanceMetrics?.rules || event.totalRulesCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Time Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Days Remaining:</span>
              <span className="text-sm font-medium">{timeAnalysis?.daysRemaining ?? event.daysRemaining}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Currently Active:</span>
              <Badge variant={timeAnalysis?.currentlyActive ?? event.isCurrentlyActive ? "default" : "secondary"}>
                {timeAnalysis?.currentlyActive ?? event.isCurrentlyActive ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expired:</span>
              <Badge variant={timeAnalysis?.expired ?? event.isExpired ? "destructive" : "default"}>
                {timeAnalysis?.expired ?? event.isExpired ? 'No' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Event Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                Rs.{eventPerformanceSummary?.totalOriginalValue?.toLocaleString() || '580'}
              </div>
              <div className="text-sm text-muted-foreground">Total Original Value</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                Rs.{eventPerformanceSummary?.totalEffectiveValue?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Effective Value</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">
                Rs.{eventPerformanceSummary?.totalCustomerSavings?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Customer Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Analysis Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0/4</div>
            <div className="text-sm text-muted-foreground">Products Affected</div>
            <div className="text-xs text-muted-foreground">0.0% of catalog</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">Rs.0</div>
            <div className="text-sm text-muted-foreground">Total Customer Savings</div>
            <div className="text-xs text-muted-foreground">0.0% of original value</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0.0%</div>
            <div className="text-sm text-muted-foreground">Average Discount</div>
            <div className="text-xs text-muted-foreground">Across 0 products</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">Rs.{eventPerformanceSummary?.totalOriginalValue || '580'}</div>
            <div className="text-sm text-muted-foreground">Revenue Impact</div>
            <div className="text-xs text-muted-foreground">Potential revenue reduction</div>
          </CardContent>
        </Card>
      </div>

      {/* Product Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Product Pricing Breakdown</CardTitle>
          <CardDescription>
            Detailed analysis of pricing impact for all products in "{event.name}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Details</TableHead>
                  <TableHead>Original Price</TableHead>
                  <TableHead>Event Discount</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>Stock Impact</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(productBreakdown && productBreakdown.length > 0) ? (
                  productBreakdown.map((product: any, index: number) => (
                    <TableRow key={product.id || index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] ? (
                            <img 
                              src={product.images[0].imageUrl} 
                              alt={product.productName}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.productName || 'Unknown Product'}</div>
                            <div className="text-xs text-muted-foreground">
                              SKU: {product.sku || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {product.categoryName || 'Electronics'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>Rs.{product.marketPrice || 0}</div>
                        <div className="text-xs text-muted-foreground">Market Price</div>
                      </TableCell>
                      <TableCell>
                        <div>{product.hasSpecificDiscount ? `${product.specificDiscount}% OFF` : 'No discount'}</div>
                      </TableCell>
                      <TableCell>
                        <div>Rs.{product.calculatedDiscountPrice || product.marketPrice || 0}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.hasSpecificDiscount ? 'Final Price' : 'Customer pays'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{product.hasSpecificDiscount ? `Rs.${product.totalSavingsAmount || 0}` : 'No savings'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {product.stockStatus || 'In Stock'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.hasSpecificDiscount ? 'Active' : 'No Active Event'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Default mock data if no products or empty array
                  [
                    { name: 'iphone 11 pro max', category: 'Electronics', originalPrice: 150, sku: 'Electronics' },
                    { name: 'Iphone 16 pro max', category: 'Electronics', originalPrice: 190, sku: 'Electronics' },
                    { name: 'pamper extra large', category: 'Baby Care', originalPrice: 50, sku: 'Baby Care' },
                    { name: 'iphone 20 pro max', category: 'Electronics', originalPrice: 190, sku: 'Electronics' }
                  ].map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                            <div className="text-xs text-muted-foreground">{product.category}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>Rs.{product.originalPrice}</div>
                        <div className="text-xs text-muted-foreground">Market Price</div>
                      </TableCell>
                      <TableCell>No discount</TableCell>
                      <TableCell>
                        <div>Rs.{product.originalPrice}</div>
                        <div className="text-xs text-muted-foreground">Customer pays</div>
                      </TableCell>
                      <TableCell>No savings</TableCell>
                      <TableCell>
                        <div className="text-xs">In Stock</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">No Active Event</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Event Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Event Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{productBreakdown?.length || 4}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-muted-foreground">On Sale</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">Rs.0</div>
              <div className="text-sm text-muted-foreground">Total Event Discounts</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">0%</div>
              <div className="text-sm text-muted-foreground">Avg Discount %</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EventDetailsDialog: React.FC<{ event: BannerEvent; isOpen: boolean; onClose: () => void }> = ({ event, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getEventTypeIcon(event.eventType)}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                {event.name}
                <Badge variant={getStatusBadgeVariant(event.status)}>{event.statusBadge}</Badge>
              </div>
              <div className="text-sm font-normal text-muted-foreground">{event.tagLine}</div>
            </div>
          </DialogTitle>
          <DialogDescription>{event.description}</DialogDescription>
        </DialogHeader>

        {/* Enhanced Tab Navigation using Tabs component */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products ({event.totalProductsCount || 0})
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Rules ({event.totalRulesCount || 0})
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing Analysis
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            {/* Event Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="text-sm font-medium">{EventType[event.eventType as keyof typeof EventType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Promotion:</span>
                    <span className="text-sm font-medium">{PromotionType[event.promotionType as keyof typeof PromotionType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <Badge variant="outline">{event.priorityBadge}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={getStatusBadgeVariant(event.status)}>{event.statusBadge}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Discount Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Discount:</span>
                    <span className="text-sm font-medium text-green-600">{event.formattedDiscount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Discount:</span>
                    <span className="text-sm font-medium">Rs.{event.maxDiscountAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Min Order:</span>
                    <span className="text-sm font-medium">Rs.{event.minOrderValue}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Usage Progress</span>
                    <span>{event.currentUsageCount} / {event.maxUsageCount}</span>
                  </div>
                  <Progress value={event.usagePercentage} className="h-2" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{event.currentUsageCount}</div>
                      <div className="text-xs text-muted-foreground">Used</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{event.remainingUsage}</div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{event.daysRemaining}</div>
                      <div className="text-xs text-muted-foreground">Days Left</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Time Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration (Nepal):</span>
                  <span className="text-sm font-medium">{event.formattedDateRangeNepal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration (UTC):</span>
                  <span className="text-sm font-medium">{event.fromattedDateRangeUtc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Time:</span>
                  <span className="text-sm font-medium">{event.activeTimeSlot || 'All Day'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm font-medium">{event.timeStatus}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab Content */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Event Products ({event.totalProductsCount || 0})</h3>
              <div className="flex gap-2">
                <Badge variant="outline">On Sale: {(event.eventProducts || []).filter(p => p.isOnSale).length}</Badge>
                <Badge variant="secondary">Total Savings: Rs.{(event.eventProducts || []).reduce((sum, p) => sum + (p.totalSavingsAmount || 0), 0).toLocaleString()}</Badge>
              </div>
            </div>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-48">Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Original Price</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Effective Price</TableHead>
                    <TableHead>Event Discount</TableHead>
                    <TableHead>Total Savings</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Event Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(event.eventProducts || []).map((product) => (
                    <TableRow key={product.id} className={product.isOnSale ? "bg-green-50/50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.productImageUrl ? (
                            <img 
                              src={product.productImageUrl} 
                              alt={product.productName}
                              className="w-12 h-12 rounded object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.productName}</div>
                            <div className="text-xs text-muted-foreground">{product.sku}</div>
                            {product.categoryName && (
                              <div className="text-xs text-muted-foreground">Category: {product.categoryName}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={product.isOnSale ? "default" : "secondary"}>
                            {product.displayStatus}
                          </Badge>
                          {product.isOnSale && (
                            <div className="text-xs text-green-600 font-medium">
                              {product.pricing?.eventStatus}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium">{product.pricing?.formattedOriginalPrice || `Rs.${product.productMarketPrice}`}</div>
                          <div className="text-xs text-muted-foreground">Market Price</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium">Rs.{product.pricing?.basePrice || product.productMarketPrice}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.pricing?.hasProductDiscount ? 'After Product Discount' : 'No Product Discount'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">
                            {product.pricing?.formattedEffectivePrice || product.displayPrice}
                          </div>
                          <div className="text-xs text-muted-foreground">Final Price</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          {product.pricing?.hasEventDiscount ? (
                            <>
                              <div className="font-medium text-orange-600">
                                -Rs.{product.pricing.eventDiscountAmount?.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {product.pricing.totalDiscountPercentage}% OFF
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground">No Event Discount</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          {(product.totalSavingsAmount || 0) > 0 ? (
                            <>
                              <div className="font-medium text-green-600">
                                {product.formattedSavings}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {product.pricing?.formattedDiscountBreakdown}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground">No Savings</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium">{product.availableStock?.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{product.stockStatus}</div>
                          {(product.reservedStock || 0) > 0 && (
                            <div className="text-xs text-orange-600">
                              Reserved: {product.reservedStock}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {product.pricing?.hasActiveEvent ? (
                            <>
                              <div className="text-xs font-medium text-blue-600">
                                {product.pricing.activeEventName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {product.pricing.eventTagLine}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Ends: {new Date(product.pricing.eventEndDate).toLocaleDateString()}
                              </div>
                              {product.pricing.isEventExpiringSoon && (
                                <Badge variant="destructive" className="text-xs">
                                  Expiring Soon
                                </Badge>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground">No Active Event</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Event Impact Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {(event.eventProducts || []).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Products</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold text-green-600">
                      {(event.eventProducts || []).filter(p => p.isOnSale).length}
                    </div>
                    <div className="text-xs text-muted-foreground">On Sale</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold text-orange-600">
                      Rs.{(event.eventProducts || []).reduce((sum, p) => sum + (p.pricing?.eventDiscountAmount || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Event Discounts</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {(event.eventProducts || []).filter(p => p.isOnSale).length > 0 
                        ? Math.round((event.eventProducts || []).filter(p => p.isOnSale).reduce((sum, p) => sum + (p.pricing?.totalDiscountPercentage || 0), 0) / (event.eventProducts || []).filter(p => p.isOnSale).length)
                        : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Discount %</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab Content */}
          <TabsContent value="rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Event Rules ({event.totalRulesCount || 0})</h3>
            </div>
            <div className="space-y-3">
              {(event.rules || []).map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{RuleType[rule.type as keyof typeof RuleType]}</Badge>
                          <Badge variant="secondary">{PromotionType[rule.discountType as keyof typeof PromotionType]}</Badge>
                        </div>
                        <p className="text-sm font-medium">{rule.ruleDescription}</p>
                        <p className="text-xs text-muted-foreground">{rule.conditions}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {rule.discountType === 0 ? `${rule.discountValue}%` : `Rs.${rule.discountValue}`}
                        </div>
                        <div className="text-xs text-muted-foreground">Priority: {rule.priority}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pricing Tab Content */}
          <TabsContent value="pricing">
            <div className="mt-6">
              <ProductPricingAnalysis 
                products={event.eventProducts || []} 
                eventName={event.name}
              />
            </div>
          </TabsContent>

          {/* Analytics Tab Content */}
          <TabsContent value="analytics">
            <EventAnalyticsView event={event} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const CreateEventDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    tagLine: '',
    eventType: 0,
    promotionType: 0,
    discountValue: 0,
    maxDiscountAmount: 0,
    minOrderValue: 0,
    startDateNepal: '',
    endDateNepal: '',
    activeTimeSlot: '',
    maxUsageCount: 100,
    maxUsagePerUser: 1,
    priority: 1
  });

  const [rules, setRules] = useState<BannerEventRule[]>([{
    type: 0,
    targetValue: '',
    conditions: '',
    discountType: 0,
    discountValue: 0,
    maxDiscount: 0,
    minOrderValue: 0,
    priority: 1
  }]);

  const [productIds, setProductIds] = useState<string>('');

  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: (data: CreateBannerEventDTO) => apiService.createBannerEvent(data),
    onSuccess: (response) => {
      console.log('Create event success:', response);
      toast.success('Banner event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['bannerEvents'] });
      onClose();
      // Reset form
      setEventData({
        name: '',
        description: '',
        tagLine: '',
        eventType: 0,
        promotionType: 0,
        discountValue: 0,
        maxDiscountAmount: 0,
        minOrderValue: 0,
        startDateNepal: '',
        endDateNepal: '',
        activeTimeSlot: '',
        maxUsageCount: 100,
        maxUsagePerUser: 1,
        priority: 1
      });
      setRules([{
        type: 0,
        targetValue: '',
        conditions: '',
        discountType: 0,
        discountValue: 0,
        maxDiscount: 0,
        minOrderValue: 0,
        priority: 1
      }]);
      setProductIds('');
    },
    onError: (error: any) => {
      console.error('Create event error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create banner event';
      toast.error(`Failed to create banner event: ${errorMessage}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productIdArray = productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    // Format dates to match API expected format
    const formatDateForAPI = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19); // Remove milliseconds and Z
    };
    
    const createData: CreateBannerEventDTO = {
      eventDto: {
        ...eventData,
        startDateNepal: formatDateForAPI(eventData.startDateNepal),
        endDateNepal: formatDateForAPI(eventData.endDateNepal)
      },
      rules: rules,
      productIds: productIdArray
    };

    console.log('Submitting banner event data:', createData);
    createEventMutation.mutate(createData);
  };

  const addRule = () => {
    setRules([...rules, {
      type: 0,
      targetValue: '',
      conditions: '',
      discountType: 0,
      discountValue: 0,
      maxDiscount: 0,
      minOrderValue: 0,
      priority: 1
    }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: string, value: any) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Banner Event</DialogTitle>
          <DialogDescription>
            Create a new promotional banner event with rules and products
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Event Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={eventData.name}
                  onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tagLine">Tag Line</Label>
                <Input
                  id="tagLine"
                  value={eventData.tagLine}
                  onChange={(e) => setEventData({ ...eventData, tagLine: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={eventData.eventType.toString()} onValueChange={(value) => setEventData({ ...eventData, eventType: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EventType).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="promotionType">Promotion Type</Label>
                <Select value={eventData.promotionType.toString()} onValueChange={(value) => setEventData({ ...eventData, promotionType: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PromotionType).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Discount Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Discount Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={eventData.discountValue}
                  onChange={(e) => setEventData({ ...eventData, discountValue: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxDiscountAmount">Max Discount Amount</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  value={eventData.maxDiscountAmount}
                  onChange={(e) => setEventData({ ...eventData, maxDiscountAmount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="minOrderValue">Min Order Value</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  value={eventData.minOrderValue}
                  onChange={(e) => setEventData({ ...eventData, minOrderValue: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Time Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Time Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDateNepal">Start Date (Nepal Time)</Label>
                <Input
                  id="startDateNepal"
                  type="datetime-local"
                  value={eventData.startDateNepal}
                  onChange={(e) => setEventData({ ...eventData, startDateNepal: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDateNepal">End Date (Nepal Time)</Label>
                <Input
                  id="endDateNepal"
                  type="datetime-local"
                  value={eventData.endDateNepal}
                  onChange={(e) => setEventData({ ...eventData, endDateNepal: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="activeTimeSlot">Active Time Slot</Label>
                <Input
                  id="activeTimeSlot"
                  placeholder="e.g., 08:00-23:59"
                  value={eventData.activeTimeSlot}
                  onChange={(e) => setEventData({ ...eventData, activeTimeSlot: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usage Limits</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxUsageCount">Max Total Usage</Label>
                <Input
                  id="maxUsageCount"
                  type="number"
                  value={eventData.maxUsageCount}
                  onChange={(e) => setEventData({ ...eventData, maxUsageCount: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="maxUsagePerUser">Max Usage Per User</Label>
                <Input
                  id="maxUsagePerUser"
                  type="number"
                  value={eventData.maxUsagePerUser}
                  onChange={(e) => setEventData({ ...eventData, maxUsagePerUser: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={eventData.priority}
                  onChange={(e) => setEventData({ ...eventData, priority: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Rules Configuration */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Event Rules</h3>
              <Button type="button" onClick={addRule} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
            
            {rules.map((rule, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Rule {index + 1}</h4>
                      {rules.length > 1 && (
                        <Button type="button" onClick={() => removeRule(index)} variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Rule Type</Label>
                        <Select value={rule.type.toString()} onValueChange={(value) => updateRule(index, 'type', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RuleType).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Target Value</Label>
                        <Input
                          value={rule.targetValue}
                          onChange={(e) => updateRule(index, 'targetValue', e.target.value)}
                          placeholder="e.g., 1,2,3 for categories"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Conditions</Label>
                      <Input
                        value={rule.conditions || ''}
                        onChange={(e) => updateRule(index, 'conditions', e.target.value)}
                        placeholder="Additional conditions"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Discount Type</Label>
                        <Select value={rule.discountType.toString()} onValueChange={(value) => updateRule(index, 'discountType', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PromotionType).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Discount Value</Label>
                        <Input
                          type="number"
                          value={rule.discountValue}
                          onChange={(e) => updateRule(index, 'discountValue', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Max Discount</Label>
                        <Input
                          type="number"
                          value={rule.maxDiscount || 0}
                          onChange={(e) => updateRule(index, 'maxDiscount', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Min Order Value</Label>
                        <Input
                          type="number"
                          value={rule.minOrderValue || 0}
                          onChange={(e) => updateRule(index, 'minOrderValue', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Product IDs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Products</h3>
            <div>
              <Label htmlFor="productIds">Product IDs (comma-separated)</Label>
              <Input
                id="productIds"
                value={productIds}
                onChange={(e) => setProductIds(e.target.value)}
                placeholder="e.g., 54, 55, 56, 10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const BannerEvents: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all-statuses');
  const [eventTypeFilter, setEventTypeFilter] = useState('all-types');
  const [selectedEvent, setSelectedEvent] = useState<BannerEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState<BannerEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'analytics'

  const queryClient = useQueryClient();

  // Get banner events with filters
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['bannerEvents', currentPage, pageSize, statusFilter, eventTypeFilter],
    queryFn: () => apiService.getAllBannerEvents({
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(statusFilter && statusFilter !== 'all-statuses' && { status: statusFilter }),
      ...(eventTypeFilter && eventTypeFilter !== 'all-types' && { eventType: eventTypeFilter })
    })
  });

  console.log("eventsData with filter:", eventsData);

  // Mutations
  const activateDeactivateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      apiService.activateOrDeactivateBannerEvent(id, isActive),
    onSuccess: (response, variables) => {
      console.log('Toggle active success:', response);
      toast.success(`Event ${variables.isActive ? 'activated' : 'deactivated'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['bannerEvents'] });
    },
    onError: (error: any) => {
      console.error('Toggle active error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update event status';
      toast.error(`Failed to update event status: ${errorMessage}`);
    }
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteBannerEvent(id),
    onSuccess: (response) => {
      console.log('Soft delete success:', response);
      toast.success('Event deleted successfully! You can restore it later.');
      queryClient.invalidateQueries({ queryKey: ['bannerEvents'] });
    },
    onError: (error: any) => {
      console.error('Soft delete error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete event';
      toast.error(`Failed to delete event: ${errorMessage}`);
    }
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteBannerEvent(id),
    onSuccess: (response) => {
      console.log('Undelete success:', response);
      toast.success('Event restored successfully!');
      queryClient.invalidateQueries({ queryKey: ['bannerEvents'] });
    },
    onError: (error: any) => {
      console.error('Undelete error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to restore event';
      toast.error(`Failed to restore event: ${errorMessage}`);
    }
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteBannerEvent(id),
    onSuccess: (response) => {
      console.log('Hard delete success:', response);
      toast.success('Event permanently deleted!');
      queryClient.invalidateQueries({ queryKey: ['bannerEvents'] });
    },
    onError: (error: any) => {
      console.error('Hard delete error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to permanently delete event';
      toast.error(`Failed to permanently delete event: ${errorMessage}`);
    }
  });

  // Filter events based on search term
  const filteredEvents = Array.isArray(eventsData?.data?.data?.data) 
    ? eventsData.data.data.data.filter(event =>
        (event.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.tagLine || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) 
    : [];
    console.log("eventsData:", eventsData);
    console.log("filetered events:",filteredEvents);
    
    // Debug the first event's date fields
    if (filteredEvents.length > 0) {
      console.log("First event date fields:", {
        startDate: filteredEvents[0].startDate,
        endDate: filteredEvents[0].endDate,
        startDateNepal: filteredEvents[0].startDateNepal,
        endDateNepal: filteredEvents[0].endDateNepal
      });
    }

  const handleToggleActive = (event: BannerEvent) => {
    activateDeactivateMutation.mutate({ id: event.id, isActive: !event.isActive });
  };

  const handleSoftDelete = (id: number) => {
    softDeleteMutation.mutate(id);
  };

  const handleRestore = (id: number) => {
    unDeleteMutation.mutate(id);
  };

  const handleHardDelete = (id: number) => {
    hardDeleteMutation.mutate(id);
  };

  const handleSelectEvent = (eventId: number) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(event => event.id));
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">⚠️ Error loading banner events</div>
          <div className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['bannerEvents'] })}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retry loading banner events</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Banner Events</h1>
          <p className="text-muted-foreground">Manage promotional banner events and campaigns</p>
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={activeTab === 'analytics' ? 'default' : 'outline'}
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View analytics and reports</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new banner event</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'events' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('events')}
        >
          Events Management
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'analytics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics & Reports
        </button>
        
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' ? (
        <BannerEventAnalyticsDashboard />
      ) : (
        <>
          {/* Filters */}
          <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events by name, description, or tag line..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                {Object.entries(EventStatus).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                {Object.entries(EventType).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all-statuses');
                  setEventTypeFilter('all-types');
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear all filters</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Events ({filteredEvents?.length || 0})</CardTitle>
            {selectedEvents.length > 0 && (
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions ({selectedEvents.length})
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Perform actions on {selectedEvents.length} selected events</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading banner events...</p>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all-statuses' || eventTypeFilter !== 'all-types' 
                  ? 'No events match your search criteria' 
                  : 'No banner events found'
                }
              </div>
              {!searchTerm && statusFilter === 'all-statuses' && eventTypeFilter === 'all-types' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get started by creating your first banner event</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Products Impact</TableHead>
                    <TableHead>Total Savings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    // Helper functions for formatting
                    const formatDiscount = () => {
                      if (event.promotionType === 0) { // Percentage
                        return `${event.discountValue}%`;
                      } else if (event.promotionType === 1) { // Fixed Amount
                        return `Rs.${event.discountValue}`;
                      }
                      return `${PromotionType[event.promotionType as keyof typeof PromotionType]}`;
                    };

                    const formatDateRange = () => {
                      try {
                        if (!event.startDate || !event.endDate) {
                          return 'No dates set';
                        }
                        
                        const startDate = new Date(event.startDate);
                        const endDate = new Date(event.endDate);
                        
                        // Check if dates are valid
                        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                          return 'Invalid dates';
                        }
                        
                        return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
                      } catch (error) {
                        console.error('Date formatting error:', error, 'Start:', event.startDate, 'End:', event.endDate);
                        return 'Date format error';
                      }
                    };

                    const calculateDaysRemaining = () => {
                      try {
                        if (!event.endDate) {
                          return 0;
                        }
                        
                        const endDate = new Date(event.endDate);
                        
                        // Check if date is valid
                        if (isNaN(endDate.getTime())) {
                          return 0;
                        }
                        
                        const today = new Date();
                        const timeDiff = endDate.getTime() - today.getTime();
                        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        return daysDiff > 0 ? daysDiff : 0;
                      } catch (error) {
                        console.error('Days calculation error:', error, 'End date:', event.endDate);
                        return 0;
                      }
                    };

                    const getStatusText = () => {
                      return EventStatus[event.status as keyof typeof EventStatus] || 'Unknown';
                    };

                    const calculateUsagePercentage = () => {
                      if (!event.maxUsageCount || event.maxUsageCount === 0) return 0;
                      return Math.round((event.currentUsageCount / event.maxUsageCount) * 100);
                    };

                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedEvents.includes(event.id)}
                            onChange={() => handleSelectEvent(event.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              {getEventTypeIcon(event.eventType)}
                              {event.name || 'Unnamed Event'}
                            </div>
                            <div className="text-xs text-muted-foreground">{event.tagLine || ''}</div>
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              {event.description || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {EventType[event.eventType as keyof typeof EventType] || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={getStatusBadgeVariant(event.status)}>
                              {getStatusText()}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {event.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-green-600">{formatDiscount()}</div>
                            <div className="text-xs text-muted-foreground">
                              Max: Rs.{event.maxDiscountAmount || 0}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Progress value={calculateUsagePercentage()} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {event.currentUsageCount || 0} / {event.maxUsageCount || 0}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div>{formatDateRange()}</div>
                            <div className="text-muted-foreground">
                              {calculateDaysRemaining()} days left
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="secondary">
                              {event.productIds?.length || 0} products
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {event.isActive ? 'Currently active' : 'Inactive'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              Rs.{(event.totalSavings || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Estimated savings
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View event details</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowImageUpload(event)}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Upload banner images</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleActive(event)}
                                  disabled={activateDeactivateMutation.isPending}
                                >
                                  {event.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{event.isActive ? 'Deactivate event' : 'Activate event'}</p>
                              </TooltipContent>
                            </Tooltip>

                            {event.isDeleted ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRestore(event.id)}
                                    disabled={unDeleteMutation.isPending}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Restore deleted event</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <AlertDialog>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete event</p>
                                  </TooltipContent>
                                </Tooltip>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Do you want to soft delete (can be restored) or permanently delete this event?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <Button
                                      variant="outline"
                                      onClick={() => handleSoftDelete(event.id)}
                                      disabled={softDeleteMutation.isPending}
                                    >
                                      Soft Delete
                                    </Button>
                                    <AlertDialogAction
                                      onClick={() => handleHardDelete(event.id)}
                                      disabled={hardDeleteMutation.isPending}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Permanent Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {eventsData?.data && eventsData.data.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Page {eventsData.data.pageNumber} of {eventsData.data.totalPages} ({eventsData.data.data?.length || 0} events shown, {eventsData.data.totalCount} total)
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!eventsData.data.hasPreviousPage}
                    >
                      Previous
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Go to previous page</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!eventsData.data.hasNextPage}
                    >
                      Next
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Go to next page</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Create Event Dialog */}
      <CreateEventDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      {/* Image Upload Dialog */}
      {showImageUpload && (
        <BannerImageUpload
          eventId={showImageUpload.id}
          eventName={showImageUpload.name}
          existingImages={showImageUpload.images}
          isOpen={!!showImageUpload}
          onClose={() => setShowImageUpload(null)}
        />
      )}
      </div>
    </TooltipProvider>
  );
};

export default BannerEvents;  