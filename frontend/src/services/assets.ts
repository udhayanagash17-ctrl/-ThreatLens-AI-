import api from './api';
import type { Asset } from '../types';

export const assetService = {
  async getAll(): Promise<Asset[]> {
    const response = await api.get<Asset[]>('/assets/');
    return response.data;
  },

  async getById(id: number): Promise<Asset> {
    const response = await api.get<Asset>(`/assets/${id}`);
    return response.data;
  },

  async create(data: Partial<Asset>): Promise<Asset> {
    const response = await api.post<Asset>('/assets/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Asset>): Promise<Asset> {
    const response = await api.put<Asset>(`/assets/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/assets/${id}`);
  },
};
