import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import {
  AlterarSenhaForm,
  InformacoesPessoaisForm,
} from '../../../../../features/editar-conta';

export const EditarPerfilPage = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <Link
          to="/aluno/perfil"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#0d9488] transition-colors hover:text-[#0f766e]"
        >
          <ChevronLeft size={16} />
          Meu Perfil
        </Link>
        <h1 className="mt-3 text-3xl font-black text-[#00214d]">Editar informações</h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Gerencie seus dados de conta e altere sua senha.
        </p>
      </header>

      <InformacoesPessoaisForm />
      <AlterarSenhaForm />
    </div>
  </div>
);
