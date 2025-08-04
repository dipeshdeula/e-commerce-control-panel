import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Package, DollarSign, Percent, Clock } from 'lucide-react';
import { BannerEventProduct } from '@/services/banner-event-service';

interface ProductPricingAnalysisProps {
  products: BannerEventProduct[];
  eventName: string;
}

export const ProductPricingAnalysis: React.FC<ProductPricingAnalysisProps> = ({ products, eventName }) => {
  const totalProducts = products.length;
  const productsOnSale = products.filter(p => p.isOnSale).length;
  const totalOriginalValue = products.reduce((sum, p) => sum + (p.pricing?.originalPrice || p.productMarketPrice || 0), 0);
  const totalEffectiveValue = products.reduce((sum, p) => sum + (p.pricing?.effectivePrice || p.currentPrice || 0), 0);
  const totalSavings = products.reduce((sum, p) => sum + (p.totalSavingsAmount || 0), 0);
  const averageDiscountPercentage = productsOnSale > 0 
    ? products.filter(p => p.isOnSale).reduce((sum, p) => sum + (p.pricing?.totalDiscountPercentage || 0), 0) / productsOnSale
    : 0;

  const highValueProducts = products
    .filter(p => (p.pricing?.originalPrice || p.productMarketPrice || 0) > 1000)
    .sort((a, b) => (b.totalSavingsAmount || 0) - (a.totalSavingsAmount || 0))
    .slice(0, 5);

  const getDiscountImpactColor = (percentage: number) => {
    if (percentage >= 40) return 'text-red-500';
    if (percentage >= 20) return 'text-orange-500';
    if (percentage >= 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStockLevelColor = (stock: number) => {
    if (stock <= 10) return 'text-red-500';
    if (stock <= 50) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Affected</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsOnSale}/{totalProducts}</div>
            <div className="text-xs text-muted-foreground">
              {((productsOnSale / totalProducts) * 100).toFixed(1)}% of catalog
            </div>
            <Progress value={(productsOnSale / totalProducts) * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customer Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs.{totalSavings.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {((totalSavings / totalOriginalValue) * 100).toFixed(1)}% of original value
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{averageDiscountPercentage.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              Across {productsOnSale} products
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rs.{(totalOriginalValue - totalEffectiveValue).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Potential revenue reduction
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Product Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Product Pricing Breakdown</CardTitle>
          <CardDescription>
            Detailed analysis of pricing impact for all products in "{eventName}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-48">Product Details</TableHead>
                  <TableHead>Original Price</TableHead>
                  <TableHead>Event Discount</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>Stock Impact</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={product.isOnSale ? "bg-green-50/50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.productImageUrl ? (
                          <img 
                            src={product.productImageUrl} 
                            alt={product.productName}
                            className="w-10 h-10 rounded object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                          {product.categoryName && (
                            <div className="text-xs text-muted-foreground">{product.categoryName}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        <div className="font-medium">
                          {product.pricing?.formattedOriginalPrice || `Rs.${product.productMarketPrice}`}
                        </div>
                        <div className="text-xs text-muted-foreground">Market Price</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        {product.pricing?.hasEventDiscount ? (
                          <>
                            <div className={`font-medium ${getDiscountImpactColor(product.pricing.totalDiscountPercentage)}`}>
                              -{product.pricing.totalDiscountPercentage.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rs.{product.pricing.eventDiscountAmount?.toFixed(2)} off
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground">No discount</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {product.pricing?.formattedEffectivePrice || product.displayPrice}
                        </div>
                        <div className="text-xs text-muted-foreground">Customer pays</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        {product.totalSavingsAmount > 0 ? (
                          <>
                            <div className="font-medium text-green-600">
                              {product.formattedSavings}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {product.pricing?.formattedDiscountBreakdown}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground">No savings</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-center">
                        <div className={`font-medium ${getStockLevelColor(product.availableStock || 0)}`}>
                          {product.availableStock?.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">{product.stockStatus}</div>
                        {product.reservedStock > 0 && (
                          <div className="text-xs text-orange-600">
                            Reserved: {product.reservedStock}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={product.isOnSale ? "default" : "secondary"}>
                          {product.displayStatus}
                        </Badge>
                        {product.pricing?.hasActiveEvent && (
                          <div className="text-xs text-blue-600">
                            {product.pricing.eventStatus}
                          </div>
                        )}
                        {product.pricing?.isEventExpiringSoon && (
                          <Badge variant="destructive" className="text-xs">
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* High Value Products Impact */}
      {highValueProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>High-Value Products Impact</CardTitle>
            <CardDescription>
              Products with highest absolute savings (&gt;Rs.1000 original price)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highValueProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.pricing?.formattedOriginalPrice} → {product.pricing?.formattedEffectivePrice}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{product.formattedSavings}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.pricing?.totalDiscountPercentage?.toFixed(1)}% discount
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Event Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                Rs.{totalOriginalValue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Original Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                Rs.{totalEffectiveValue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Effective Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                Rs.{totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Customer Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
