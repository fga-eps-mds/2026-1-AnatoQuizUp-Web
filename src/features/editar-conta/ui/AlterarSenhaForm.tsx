import { useState } from 'react';
import { KeyRound, Save } from 'lucide-react';

import {
  alterarSenha,
  SenhaAtualIncorretaError,
} from '../model/editarContaService';

type FieldErrors = {
  senhaAtual?: string;
  novaSenha?: string;
  confirmacaoNovaSenha?: string;
};

const INPUT_BASE_CLASS =
  'h-11 w-full rounded-lg border bg-white px-3.5 text-sm font-semibold text-[#0A1128] outline-none transition-colors placeholder:text-gray-400 focus:border-[#14b8a6]';

const campoClass = (hasError: boolean) => (
  `${INPUT_BASE_CLASS} ${hasError ? 'border-red-400' : 'border-gray-200'}`
);

const mensagemErro = (err: unknown, fallback: string) => (
  err instanceof Error ? err.message : fallback
);

const validar = (
  senhaAtual: string,
  novaSenha: string,
  confirmacaoNovaSenha: string,
): FieldErrors => {
  const errors: FieldErrors = {};

  if (!senhaAtual) {
    errors.senhaAtual = 'Informe a senha atual.';
  }

  if (!novaSenha) {
    errors.novaSenha = 'Informe a nova senha.';
  } else if (novaSenha.length < 8) {
    errors.novaSenha = 'Mínimo de 8 caracteres.';
  } else if (senhaAtual && novaSenha === senhaAtual) {
    errors.novaSenha = 'A nova senha deve ser diferente da senha atual.';
  }

  if (!confirmacaoNovaSenha) {
    errors.confirmacaoNovaSenha = 'Confirme a nova senha.';
  } else if (novaSenha !== confirmacaoNovaSenha) {
    errors.confirmacaoNovaSenha = 'A confirmação não corresponde à nova senha.';
  }

  return errors;
};

export const AlterarSenhaForm = () => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setFormError('');
    setSuccessMessage('');

    const errors = validar(senhaAtual, novaSenha, confirmacaoNovaSenha);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      await alterarSenha({
        senhaAtual,
        novaSenha,
        confirmacaoNovaSenha,
      });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacaoNovaSenha('');
      setSuccessMessage('Senha alterada.');
    } catch (err) {
      if (err instanceof SenhaAtualIncorretaError) {
        setFieldErrors({ senhaAtual: err.message });
        return;
      }

      setFormError(mensagemErro(err, 'Não foi possível alterar a senha.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      aria-label="alterar senha"
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <KeyRound size={20} />
        </span>
        <div>
          <h2 className="text-xl font-black text-[#00214d]">Alterar senha</h2>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Use sua senha atual para confirmar a alteração.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="senhaAtual" className="text-sm font-bold text-[#00214d]">
            Senha atual
          </label>
          <input
            id="senhaAtual"
            type="password"
            autoComplete="current-password"
            value={senhaAtual}
            aria-invalid={Boolean(fieldErrors.senhaAtual)}
            className={campoClass(Boolean(fieldErrors.senhaAtual))}
            onChange={(event) => setSenhaAtual(event.target.value)}
          />
          {fieldErrors.senhaAtual ? (
            <span className="text-xs font-semibold text-red-500">{fieldErrors.senhaAtual}</span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="novaSenha" className="text-sm font-bold text-[#00214d]">
              Nova senha
            </label>
            <input
              id="novaSenha"
              type="password"
              autoComplete="new-password"
              value={novaSenha}
              aria-invalid={Boolean(fieldErrors.novaSenha)}
              className={campoClass(Boolean(fieldErrors.novaSenha))}
              onChange={(event) => setNovaSenha(event.target.value)}
            />
            {fieldErrors.novaSenha ? (
              <span className="text-xs font-semibold text-red-500">{fieldErrors.novaSenha}</span>
            ) : (
              <span className="text-xs font-semibold text-gray-500">Mínimo de 8 caracteres.</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmacaoNovaSenha" className="text-sm font-bold text-[#00214d]">
              Confirme nova senha
            </label>
            <input
              id="confirmacaoNovaSenha"
              type="password"
              autoComplete="new-password"
              value={confirmacaoNovaSenha}
              aria-invalid={Boolean(fieldErrors.confirmacaoNovaSenha)}
              className={campoClass(Boolean(fieldErrors.confirmacaoNovaSenha))}
              onChange={(event) => setConfirmacaoNovaSenha(event.target.value)}
            />
            {fieldErrors.confirmacaoNovaSenha ? (
              <span className="text-xs font-semibold text-red-500">
                {fieldErrors.confirmacaoNovaSenha}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {formError ? (
        <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
          {formError}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14b8a6] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0d9488] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Save size={16} />
          {isLoading ? 'Salvando...' : 'Alterar senha'}
        </button>
      </div>
    </form>
  );
};
