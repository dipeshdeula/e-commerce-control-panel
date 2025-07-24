
import { BaseApiService } from '@/shared/services/base-api';
import { TransactionDTO } from '@/types/api';

export class TransactionService extends BaseApiService {
  async getTransactions(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/transaction`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<TransactionDTO[]>(response);
  }

  async getTransactionById(id: number) {
    const response = await fetch(`${this.BASE_URL}/transaction/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<TransactionDTO>(response);
  }

  async createTransaction(transaction: Omit<TransactionDTO, 'transactionId'>) {
    const response = await fetch(`${this.BASE_URL}/transaction`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    return this.handleResponse<TransactionDTO>(response);
  }

  async updateTransaction(id: number, transaction: Partial<TransactionDTO>) {
    const response = await fetch(`${this.BASE_URL}/transaction/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    return this.handleResponse<TransactionDTO>(response);
  }

  async deleteTransaction(id: number) {
    const response = await fetch(`${this.BASE_URL}/transaction/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async updateTransactionStatus(id: number, status: string) {
    const response = await fetch(`${this.BASE_URL}/transaction/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse<TransactionDTO>(response);
  }
}
