import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../shared/ui/button/Button';
import { resetPassword } from '../model/recoverPasswordService';
import { FeedbackMessage } from './FeedbackMessage';

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

type PasswordFieldsProps = {
  confirmPassword: string;
  fieldErrors: FieldErrors;
  isLoading: boolean;
  password: string;
  onConfirmPasswordChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

const INPUT_BASE_CLASS =
  'h-10 w-full rounded-[7px] border bg-white px-3.5 text-sm text-[#0A1128] outline-none transition-colors placeholder:text-[#0A1128]/45 focus:border-[#14D5C2] ';

const validate = (password: string, confirmPassword: string): FieldErrors => {
  const errors: FieldErrors = {};

  if (!password) {
    errors.password = 'Senha e obrigatoria.';
  } else if (password.length < 8) {
    errors.password = 'Minimo de 8 caracteres.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirmacao de senha e obrigatoria.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'As senhas nao coincidem.';
  }

  return errors;
};

const getPasswordHintClass = (hasError: boolean) => {
  if (hasError) {
    return 'text-xs font-medium text-red-500';
  }

  return 'text-xs font-medium text-[#0A1128]/45';
};

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) {
    return err.message;
  }

  return 'Link expirado ou invalido.';
};

const PasswordFields = ({
  confirmPassword,
  fieldErrors,
  isLoading,
  password,
  onConfirmPasswordChange,
  onPasswordChange,
}: PasswordFieldsProps) => {
  const passwordHasError = Boolean(fieldErrors.password);
  const confirmPasswordHasError = Boolean(fieldErrors.confirmPassword);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium text-[#0A1128]">
          Nova senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          aria-invalid={passwordHasError}
          className={`${INPUT_BASE_CLASS}${passwordHasError ? 'border-red-400' : 'border-[#14D5C2]'}`}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
        <span className={getPasswordHintClass(passwordHasError)}>
          {fieldErrors.password ?? 'Minimo de 8 caracteres.'}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-xs font-medium text-[#0A1128]">
          Confirme nova senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          aria-invalid={confirmPasswordHasError}
          className={`${INPUT_BASE_CLASS}${confirmPasswordHasError ? 'border-red-400' : 'border-[#D7DEE8]'}`}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
        />
        {fieldErrors.confirmPassword ? (
          <span className="text-xs font-medium text-red-500">
            {fieldErrors.confirmPassword}
          </span>
        ) : null}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
      </Button>
    </>
  );
};

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState(token ? '' : 'Link expirado ou invalido.');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setFormError('');
    setSuccessMessage('');

    if (!token) {
      setFormError('Link expirado ou invalido.');
      return;
    }

    const errors = validate(password, confirmPassword);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const message = await resetPassword(token, password);
      setSuccessMessage(message);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const feedback = successMessage || formError;
  const feedbackVariant = successMessage ? 'success' : 'error';
  const feedbackLink = successMessage ? '/login' : '/esqueci-senha';
  const feedbackLinkLabel = successMessage ? 'Ir para o login ->' : 'Recuperar senha ->';

  return (
    <form
      aria-label="redefinir senha"
      className="flex w-full max-w-[340px] flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div>
        <h1 className="text-3xl font-black text-[#0A1128]">Redefinir senha</h1>
        <p className="mt-3 max-w-[280px] text-xs font-medium leading-relaxed text-[#0A1128]/70">
          Escolha uma nova senha para sua conta
        </p>
      </div>

      {feedback ? (
        <FeedbackMessage variant={feedbackVariant}>
          {feedback}{' '}
          <Link to={feedbackLink} className="underline underline-offset-2">
            {feedbackLinkLabel}
          </Link>
        </FeedbackMessage>
      ) : (
        <PasswordFields
          confirmPassword={confirmPassword}
          fieldErrors={fieldErrors}
          isLoading={isLoading}
          password={password}
          onConfirmPasswordChange={setConfirmPassword}
          onPasswordChange={setPassword}
        />
      )}
    </form>
  );
};
