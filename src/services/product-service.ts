
import { BaseApiService } from './base-api';
import { ProductDTO } from '@/types/api';

export class ProductService extends BaseApiService {
  async getProducts(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/Product`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ProductDTO[]>(response);
  }

  async createProduct(product: Omit<ProductDTO, 'productId'>) {
    const response = await fetch(`${this.BASE_URL}/Product`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return this.handleResponse<ProductDTO>(response);
  }

  async updateProduct(product: Partial<ProductDTO> & { id: number }) {
    const { id, ...updateData } = product;
    const response = await fetch(`${this.BASE_URL}/Product/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return this.handleResponse<ProductDTO>(response);
  }

  async deleteProduct(id: number) {
    const response = await fetch(`${this.BASE_URL}/Product/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeleteProduct(id: number) {
    const response = await fetch(`${this.BASE_URL}/Product/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteProduct(id: number) {
    const response = await fetch(`${this.BASE_URL}/Product/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }
}
