import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/button/Button';
import { requestPasswordRecovery } from '../model/recoverPasswordService';
import { FeedbackMessage } from './FeedbackMessage';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    setFieldError('');
    setFormError('');
    setSuccessMessage('');

    if (!trimmedEmail) {
      setFieldError('Email e obrigatorio.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setFieldError('Informe um email valido.');
      return;
    }

    setIsLoading(true);

    try {
      const message = await requestPasswordRecovery(trimmedEmail);
      setSuccessMessage(message);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nao foi possivel enviar as instrucoes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      aria-label="recuperar senha"
      className="flex w-full max-w-[340px] flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div>
        <h1 className="text-3xl font-black text-[#0A1128]">Recuperar Senha</h1>
        <p className="mt-3 max-w-[280px] text-xs font-medium leading-relaxed text-[#0A1128]/70">
          Informe seu email e enviaremos instrucoes para redefinir sua senha
        </p>
      </div>

      {successMessage ? (
        <FeedbackMessage variant="success">{successMessage}</FeedbackMessage>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-[#0A1128]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              aria-invalid={!!fieldError}
              placeholder="Aluno@UnB"
              className={
                'h-10 w-full rounded-[7px] border bg-white px-3.5 text-sm text-[#0A1128] outline-none transition-colors placeholder:text-[#0A1128]/45 focus:border-[#14D5C2] ' +
                (fieldError ? 'border-red-400' : 'border-[#14D5C2]')
              }
              onChange={(event) => setEmail(event.target.value)}
            />
            {fieldError ? (
              <span className="text-xs font-medium text-red-500">{fieldError}</span>
            ) : null}
          </div>

          {formError ? <FeedbackMessage variant="error">{formError}</FeedbackMessage> : null}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar instrucoes'}
          </Button>
        </>
      )}

      <Link
        to="/login"
        className="text-center text-xs font-bold text-[#00A99D] transition-colors hover:text-[#007B6E]"
      >
        Voltar para o login
      </Link>
    </form>
  );
};
