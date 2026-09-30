import api from './api';
import type { SBOMComponent, SBOMScan } from '../types';

export const sbomService = {
  async upload(data: { filename: string; content: string }): Promise<{
    message: string;
    total_components: number;
    vulnerable_components: number;
    findings_count: number;
    severity_counts: Record<string, number>;
  }> {
    const response = await api.post('/sbom/upload', data);
    return response.data;
  },

  async getComponents(): Promise<SBOMComponent[]> {
    const response = await api.get<SBOMComponent[]>('/sbom/components');
    return response.data;
  },

  async getScans(): Promise<SBOMScan[]> {
    const response = await api.get<SBOMScan[]>('/sbom/scans');
    return response.data;
  },
};
