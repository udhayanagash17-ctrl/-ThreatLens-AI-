import api from './api';
import type { ReportSummary } from '../types';

export const reportService = {
  async getSummary(): Promise<ReportSummary> {
    const response = await api.get<ReportSummary>('/reports/summary');
    return response.data;
  },

  async getFullReport(): Promise<Record<string, unknown>> {
    const response = await api.get('/reports/full');
    return response.data;
  },
};
