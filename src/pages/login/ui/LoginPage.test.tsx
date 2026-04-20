import { render, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';

jest.mock('../../../features/auth-by-credencials/ui/LoginForm', () => ({
  LoginForm: () => <div data-testid="mock-login-form">Mock do Formulário</div>
}));

jest.mock('../../../shared/assets/image/logo.png', () => 'imagem-falsa');

describe('Pages/LoginPage', () => {
  it('deve renderizar o layout da página com mascote e formulário', () => {
    render(<LoginPage />);

    const imageElement = screen.getByAltText(/mascote cérebro/i);
    expect(imageElement).toBeInTheDocument();

    const formElement = screen.getByTestId('mock-login-form');
    expect(formElement).toBeInTheDocument();
  });
});