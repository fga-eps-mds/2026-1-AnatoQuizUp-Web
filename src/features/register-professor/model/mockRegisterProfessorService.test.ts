import { registerProfessorMock } from './mockRegisterProfessorService';
import { PROFESSOR_INSTITUTION, type RegisterProfessorFormValues } from './types';

const formValues: RegisterProfessorFormValues = {
  fullName: 'Hilmer Rodrigues Neri',
  email: 'hilmer@unb.br',
  password: 'senhaValida123',
  confirmPassword: 'senhaValida123',
  institution: PROFESSOR_INSTITUTION,
  siape: '1234567',
  department: 'Anatomia',
  course: 'Medicina',
};

describe('registerProfessorMock', () => {
  it('resolve cadastro simulado do professor', async () => {
    await expect(registerProfessorMock(formValues)).resolves.toBeUndefined();
  });
});
