
import { BaseApiService } from '@/shared/services/base-api';
import { ProductDTO } from '@/types/api';

export class ProductService extends BaseApiService {
  
  // Get all products with pagination (for customer view - active products only)
  async getProducts(params: { page?: number; pageSize?: number } = {}) {
    let url = `${this.BASE_URL}/products/getAllProducts`;
    const { page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());

    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    console.log("product response data:", response);
    const result = await this.handleResponse<ProductDTO[]>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch products');
    }
    return result;
  }

  // Admin endpoint: Get all products (both active and inactive) 
  async getAllProductsAdmin(params: { 
    page?: number; 
    pageSize?: number; 
    includeInactive?: boolean 
  } = {}) {
    let url = `${this.BASE_URL}/products/admin/getAllProducts`;
    const { page = 1, pageSize = 10, includeInactive = true } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());
    queryParams.append('includeInactive', includeInactive.toString());

    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    console.log("admin products:", response);
    const result = await this.handleResponse<ProductDTO[]>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch admin products');
    }
    return result;
  }

  // Get products with dynamic pricing (considering active banner events)
  async getProductsWithDynamicPricing(params: { 
    page?: number; 
    pageSize?: number; 
    includeEventPricing?: boolean 
  } = {}) {
    let url = `${this.BASE_URL}/products/getAllProductsWithEventPricing`;
    const { page = 1, pageSize = 10, includeEventPricing = true } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());
    queryParams.append('includeEventPricing', includeEventPricing.toString());

    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    console.log("products with dynamic pricing:", response);
    const result = await this.handleResponse<ProductDTO[]>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch products with dynamic pricing');
    }
    return result;
  }

  // Get products by SubSubCategory ID
  async getProductsBySubSubCategoryId(subSubCategoryId: number, params: { page?: number; pageSize?: number } = {}) {
    let url = `${this.BASE_URL}/products/getAllProductBySubSubCategoryId`;
    const { page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('SubSubCategoryId', subSubCategoryId.toString());
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());

    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch products by sub-subcategory');
    }
    return result;
  }

  // Get products by Category ID
  async getProductsByCategoryId(categoryId: number, params: { page?: number; pageSize?: number } = {}) {
    let url = `${this.BASE_URL}/category/getAllProdcutByCategoryById`;
    const { page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('categoryId', categoryId.toString());
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());

    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch products by category');
    }
    return result;
  }

  // Get product by ID
  async getProductById(productId: number, params: { page?: number; pageSize?: number } = {}) {
    let url = `${this.BASE_URL}/products/getProductById`;
    const { page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('productId', productId.toString());
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());

    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<ProductDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch product');
    }
    return result;
  }

  // Create new product
async createProduct(
  productData: {
    name: string;
    slug: string;
    description: string;
    marketPrice: number;
    costPrice: number;
    discountPercentage: number;
    stockQuantity: number;
    sku: string;
    weight: string;
    reviews: number;
    rating: number;
    dimensions: string;
  },
  categoryId: number,   
  subCategoryId?: number, 
  subSubCategoryId?: number
) {

   
    // Build query params only for defined values
    const queryParams: string[] = [];
    if(categoryId > 0) queryParams.push(`categoryId=${categoryId}`);
    if (typeof subCategoryId === 'number' && subCategoryId > 0) queryParams.push(`subCategoryId=${subCategoryId}`);
    if (typeof subSubCategoryId === 'number' && subSubCategoryId > 0) queryParams.push(`subSubCategoryId=${subSubCategoryId}`);

    console.log("query params:",queryParams);

    const url = `${this.BASE_URL}/products/create-product${queryParams.length ? '?' + queryParams.join('&') : ''}`;
    console.log("product service url:",url);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    
    const result = await this.handleResponse<{message:string,data:ProductDTO}>(response);
    console.log("product result",result);
    if (!result.success) {
      throw new Error(result.message || 'Failed to create product');
    }
    return result;
  }
  async updateProduct(productId: number, productData: {
    name: string;
    slug: string;
    description: string;
    marketPrice: number;
    costPrice: number;
    discountPrice: number;
    discountPercentage: number;
    stockQuantity: number;
    sku: string;
    weight: string;
    reviews: number;
    rating: number;
    dimensions: string;
    categoryId?: number,
    subCategoryId?: number,
    subSubCategoryId?: number
  }) {
    const url = `${this.BASE_URL}/products/updateProduct?ProductId=${productId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(productData)
    });
    
    const result = await this.handleResponse<ProductDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update product');
    }
    return result;
  }

  // Upload product images
  async uploadProductImages(productId: number, files: File[]) {
    const url = `${this.BASE_URL}/products/UploadProductImages`;
    
    const formData = new FormData();
    formData.append('productId', productId.toString());
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    
    const result = await this.handleResponse<any[]>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to upload product images');
    }
    return result;
  }

  // Soft delete product
  async softDeleteProduct(productId: number) {
    const url = `${this.BASE_URL}/products/softdDeleteProduct?productId=${productId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to soft delete product');
    }
    return result;
  }

  // Hard delete product
  async hardDeleteProduct(productId: number) {
    const url = `${this.BASE_URL}/products/hardDeleteProduct?productId=${productId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to permanently delete product');
    }
    return result;
  }

  // Undelete product
  async unDeleteProduct(productId: number) {
    const url = `${this.BASE_URL}/products/unDeleteProduct?productId=${productId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to restore product');
    }
    return result;
  }

  async getProductImages(productId : number)
  {
    const url = `${this.BASE_URL}/products/getProductImages?productId=${productId}`;
    const response = await fetch(url,{
      headers:this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }
}
