import type { RegisterProfessorFormValues } from './types';

export const registerProfessorMock = (
  values: RegisterProfessorFormValues,
): Promise<void> => Promise.resolve(values).then(() => undefined);
