import { registerStudentMock } from './mockRegisterStudentService';
import type { RegisterStudentFormValues } from './types';

const validValues: RegisterStudentFormValues = {
  fullName: 'Ana Silva',
  nickname: 'ana',
  email: 'ana@unb.br',
  password: 'password123',
  confirmPassword: 'password123',
  birthDate: '2000-01-01',
  nationality: 'Brasileiro(a)',
  state: 'DF',
  city: 'Brasilia',
  education: 'Graduacao',
  institution: 'Universidade de Brasilia',
  course: 'Medicina',
  period: '1',
};

describe('registerStudentMock', () => {
  it('resolve cadastro mockado sem chamar API', async () => {
    await expect(registerStudentMock(validValues)).resolves.toBeUndefined();
  });
});
