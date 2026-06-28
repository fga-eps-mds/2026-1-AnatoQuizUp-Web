import { useState } from 'react';
import { Mail, Save, UserRound } from 'lucide-react';

import { useAuth } from '../../../app/providers/AuthProvider';
import {
  ApelidoEmUsoError,
  atualizarDadosPessoais,
} from '../model/editarContaService';

// Erros de validacao por campo do formulario de dados pessoais.
type FieldErrors = {
  nome?: string;
  apelido?: string;
};

// Regras de formato: nome aceita apenas letras/espacos; apelido comeca com letra (minusculas/numeros/_).
const FORMATO_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/;
const FORMATO_NICKNAME = /^[a-z][a-z0-9_]*$/;
// Classe base dos inputs, reutilizada em todos os campos do formulario.
const INPUT_BASE_CLASS =
  'h-11 w-full rounded-lg border bg-white px-3.5 text-sm font-semibold text-[#0A1128] outline-none transition-colors placeholder:text-gray-400 focus:border-[#14b8a6] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';

/** Monta a classe do input, destacando a borda quando ha erro. */
const campoClass = (hasError: boolean) => (
  `${INPUT_BASE_CLASS} ${hasError ? 'border-red-400' : 'border-gray-200'}`
);

/** Extrai a mensagem de um erro desconhecido, com texto de fallback. */
const mensagemErro = (err: unknown, fallback: string) => (
  err instanceof Error ? err.message : fallback
);

/** Valida nome e apelido, retornando um mapa de erros por campo (vazio = valido). */
const validar = (nome: string, apelido: string): FieldErrors => {
  const errors: FieldErrors = {};
  const nomeNormalizado = nome.trim();
  const apelidoNormalizado = apelido.trim().toLowerCase();

  if (!nomeNormalizado) {
    errors.nome = 'Nome é obrigatório.';
  } else if (!FORMATO_NOME.test(nomeNormalizado)) {
    errors.nome = 'Nome deve conter apenas letras e espaços.';
  }

  if (!apelidoNormalizado) {
    errors.apelido = 'Apelido é obrigatório.';
  } else if (apelidoNormalizado.length < 3 || apelidoNormalizado.length > 20) {
    errors.apelido = 'Use de 3 a 20 caracteres.';
  } else if (!FORMATO_NICKNAME.test(apelidoNormalizado)) {
    errors.apelido = 'Apelido deve começar com letra e conter apenas minúsculas, números e _.';
  }

  return errors;
};

/**
 * Formulario de edicao de nome e apelido do usuario (o e-mail e somente leitura).
 * Valida no cliente, persiste via service e recarrega o usuario autenticado ao salvar.
 */
export const InformacoesPessoaisForm = () => {
  const { user, recarregarUsuario } = useAuth();
  // Campos editaveis inicializados com os dados atuais do usuario.
  const [nome, setNome] = useState(user?.name ?? '');
  const [apelido, setApelido] = useState(user?.nickname ?? '');
  // Erros por campo, erro/sucesso geral e estado de envio.
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return null;
  }

  /** Valida, envia a atualizacao e trata o erro especifico de apelido em uso. */
  const handleSubmit = async () => {
    setFormError('');
    setSuccessMessage('');

    const errors = validar(nome, apelido);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      await atualizarDadosPessoais({
        nome: nome.trim(),
        nickname: apelido.trim().toLowerCase(),
      });
      await recarregarUsuario();
      setSuccessMessage('Informações atualizadas.');
    } catch (err) {
      if (err instanceof ApelidoEmUsoError) {
        setFieldErrors({ apelido: err.message });
        return;
      }

      setFormError(mensagemErro(err, 'Não foi possível salvar suas informações.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      aria-label="editar informações pessoais"
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <UserRound size={20} />
        </span>
        <div>
          <h2 className="text-xl font-black text-[#00214d]">Informações pessoais</h2>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Atualize como seu nome e apelido aparecem no AnatoQuizUp.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nome" className="text-sm font-bold text-[#00214d]">
            Nome
          </label>
          <input
            id="nome"
            value={nome}
            aria-invalid={Boolean(fieldErrors.nome)}
            className={campoClass(Boolean(fieldErrors.nome))}
            onChange={(event) => setNome(event.target.value)}
          />
          {fieldErrors.nome ? (
            <span className="text-xs font-semibold text-red-500">{fieldErrors.nome}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="apelido" className="text-sm font-bold text-[#00214d]">
            Apelido
          </label>
          <input
            id="apelido"
            value={apelido}
            aria-invalid={Boolean(fieldErrors.apelido)}
            className={campoClass(Boolean(fieldErrors.apelido))}
            onChange={(event) => setApelido(event.target.value.toLowerCase())}
          />
          {fieldErrors.apelido ? (
            <span className="text-xs font-semibold text-red-500">{fieldErrors.apelido}</span>
          ) : (
            <span className="text-xs font-semibold text-gray-500">
              3 a 20 caracteres; letras minúsculas, números e _.
            </span>
          )}
        </div>

        {/* E-mail exibido apenas para leitura; alteracao depende da administracao. */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="email" className="text-sm font-bold text-[#00214d]">
              E-mail
            </label>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Não editável
            </span>
          </div>
          <div className="relative">
            <Mail
              aria-hidden="true"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="email"
              value={user.email}
              readOnly
              disabled
              className={`${INPUT_BASE_CLASS} border-gray-200 pl-9`}
            />
          </div>
          <span className="text-xs font-semibold text-gray-500">
            Para alterar o e-mail, fale com a administração.
          </span>
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
          {isLoading ? 'Salvando...' : 'Salvar informações'}
        </button>
      </div>
    </form>
  );
};
