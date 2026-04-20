import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { BrowserRouter } from 'react-router-dom';
import { loginWithCredencials } from '../model/authService';

const mockLogin = jest.fn();
jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock('../model/authService', () => ({
  loginWithCredencials: jest.fn().mockResolvedValue({
    token: 'fake-token',
    user: { name: 'Pedro', course: 'Engenharia de Software' }
  }),
}));

describe('Features/LoginForm', () => {
  it('deve mostrar erro se os campos estiverem vazios ao submeter', async () => {
    render(<LoginForm />, { wrapper: BrowserRouter });
    
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));
    
    expect(await screen.findByText(/campos obrigatórios/i)).toBeInTheDocument();
  });

  it('deve realizar o fluxo de login com sucesso', async () => {
    render(<LoginForm />, { wrapper: BrowserRouter });

    fireEvent.change(screen.getByPlaceholderText('Aluno@UnB'), { target: { value: 'aluno@unb.br' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('fake-token', expect.any(Object));
    });
  });

  it('deve exibir mensagem de erro se a API falhar', async () => {
    (loginWithCredencials as jest.Mock).mockRejectedValueOnce(new Error('Credenciais inválidas'));

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Aluno@UnB'), { target: { value: 'errado@unb.br' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByText(/ocorreu um erro inesperado/i)).toBeInTheDocument();
  });
});