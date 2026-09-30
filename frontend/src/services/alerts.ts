import api from './api';
import type { Alert } from '../types';

export const alertService = {
  async getAll(): Promise<Alert[]> {
    const response = await api.get<Alert[]>('/alerts/');
    return response.data;
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await api.get('/alerts/unread');
    return response.data;
  },

  async markRead(id: number): Promise<void> {
    await api.post(`/alerts/${id}/read`);
  },

  async dismiss(id: number): Promise<void> {
    await api.post(`/alerts/${id}/dismiss`);
  },
};
