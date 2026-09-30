import api from './api';
import type { Vulnerability } from '../types';

export const vulnerabilityService = {
  async getAll(filters?: { severity?: string; status?: string }): Promise<Vulnerability[]> {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    const response = await api.get<Vulnerability[]>(`/vulnerabilities/?${params}`);
    return response.data;
  },

  async getById(id: number): Promise<Vulnerability> {
    const response = await api.get<Vulnerability>(`/vulnerabilities/${id}`);
    return response.data;
  },

  async getStats(): Promise<{ total: number; by_severity: Record<string, number>; by_status: Record<string, number> }> {
    const response = await api.get('/vulnerabilities/stats');
    return response.data;
  },

  async update(id: number, data: { status?: string; ai_analysis?: string }): Promise<Vulnerability> {
    const response = await api.put<Vulnerability>(`/vulnerabilities/${id}`, data);
    return response.data;
  },

  async analyze(id: number): Promise<{ analysis: string }> {
    const response = await api.post(`/vulnerabilities/${id}/analyze`);
    return response.data;
  },
};
