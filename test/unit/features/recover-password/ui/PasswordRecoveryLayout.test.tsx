import { render, screen } from '@testing-library/react';

import { PasswordRecoveryLayout } from '../../../../../src/features/recover-password/ui/PasswordRecoveryLayout';

describe('PasswordRecoveryLayout', () => {
  it('renderiza logo e conteudo recebido', () => {
    render(
      <PasswordRecoveryLayout>
        <form aria-label="Formulario de recuperacao">conteudo</form>
      </PasswordRecoveryLayout>,
    );

    expect(screen.getByAltText('Logo AnatoQuizUp')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Formulario de recuperacao' })).toHaveTextContent(
      'conteudo',
    );
  });
});
