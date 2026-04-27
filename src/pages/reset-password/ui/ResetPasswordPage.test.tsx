jest.mock('../../../features/recover-password', () => ({
  PasswordRecoveryLayout: ({ children }: { children: ReactNode }) => (
    <main>
      <span>Recovery layout</span>
      {children}
    </main>
  ),
  ResetPasswordForm: () => <form aria-label="reset password form" />,
}));

import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { ResetPasswordPage } from './ResetPasswordPage';

describe('ResetPasswordPage', () => {
  it('renders recovery layout and reset password form', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText('Recovery layout')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /reset password form/i })).toBeInTheDocument();
  });
});
