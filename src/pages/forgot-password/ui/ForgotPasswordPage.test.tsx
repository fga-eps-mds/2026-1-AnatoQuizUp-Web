jest.mock('../../../features/recover-password', () => ({
  ForgotPasswordForm: () => <form aria-label="forgot password form" />,
  PasswordRecoveryLayout: ({ children }: { children: ReactNode }) => (
    <main>
      <span>Recovery layout</span>
      {children}
    </main>
  ),
}));

import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { ForgotPasswordPage } from './ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  it('renders recovery layout and forgot password form', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText('Recovery layout')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /forgot password form/i })).toBeInTheDocument();
  });
});
