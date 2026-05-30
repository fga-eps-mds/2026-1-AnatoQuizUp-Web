import type { DashboardMacro } from '../model/types';
import { httpClient } from '../../../shared/api/httpClient'; 

export const buscarDashboardMacro = async (turmaId: string): Promise<DashboardMacro> => {
  const { data } = await httpClient.get(`/turmasDashboard/${turmaId}/macro`);
  return data;
};