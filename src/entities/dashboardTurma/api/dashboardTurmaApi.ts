import type { DashboardIndividual, DashboardMacro } from '../model/types';
import { httpClient } from '../../../shared/api/httpClient';

export const buscarDashboardMacro = async (turmaId: string): Promise<DashboardMacro> => {
  const { data } = await httpClient.get(`/turmasDashboard/${turmaId}/macro`);
  return data;
};

export const buscarDesempenhoIndividual = async (turmaId: string): Promise<DashboardIndividual> => {
  const { data } = await httpClient.get(`/turmasDashboard/${turmaId}/individual`);
  return data;
};