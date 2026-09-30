import api from './api';
import type { Scan } from '../types';

export const scanService = {
  async getAll(): Promise<Scan[]> {
    const response = await api.get<Scan[]>('/scans/');
    return response.data;
  },

  async getById(id: number): Promise<Scan> {
    const response = await api.get<Scan>(`/scans/${id}`);
    return response.data;
  },

  async runScan(data: { target: string; scan_type?: string; asset_id?: number }): Promise<Scan> {
    const response = await api.post<Scan>('/scans/run', data);
    return response.data;
  },
};
