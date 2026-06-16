import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

import { httpClient } from '../../../shared/api/httpClient';
import type { Turma } from '../../../entities/turmas/model/types';
import { buscarUsuarioPorId } from '../../../entities/usuarios/api/usuarioApi';
import type { UsuarioPublico } from '../../../entities/usuarios/model/types';

import { ListagemListas } from '../../resolucaoLista/ui/ListagemListas'; 

type EstadoDetalhe = 'carregando' | 'sucesso' | 'erro' | 'nao-encontrada';

interface TurmaApi extends Omit<Turma, 'quantidadeAlunos'> {
  quantidadeAlunos?: number;
  _count?: { alunos?: number };
  professorId: string;
}

interface RespostaApi<T> {
  mensagem?: string;
  dados: T;
}

const normalizarTurma = (turma: TurmaApi): Turma & { professorId: string } => {
  const { _count, quantidadeAlunos, ...resto } = turma;
  return {
    ...resto,
    quantidadeAlunos: quantidadeAlunos ?? _count?.alunos ?? 0,
  };
};

const buscarTurma = async (id: string) => {
  const response = await httpClient.get<RespostaApi<TurmaApi>>(`/turmas/${id}`);
  return normalizarTurma(response.data.dados);
};

const ehErroNaoEncontrado = (erro: unknown) => {
  return axios.isAxiosError(erro) && erro.response?.status === 404;
};

const EstadoCarregando = () => (
  <div className="flex flex-1 items-center justify-center min-h-[400px]">
    <span className="animate-pulse text-sm text-gray-500 font-bold">Carregando detalhes da turma...</span>
  </div>
);

const EstadoNaoEncontrada = ({ onVoltar }: { onVoltar: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6">
    <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center w-full max-w-2xl flex flex-col items-center">
      <div className="font-bold text-lg mb-2 text-red-600">Turma não encontrada</div>
      <div className="text-sm text-gray-500 max-w-md mb-6">Esta turma não existe ou você não está vinculado a ela.</div>
      <button 
        onClick={onVoltar} 
        className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        Voltar para minhas turmas
      </button>
    </div>
  </div>
);

const EstadoErro = ({ onVoltar }: { onVoltar: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6">
    <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center w-full max-w-2xl flex flex-col items-center">
      <div className="font-bold text-lg mb-2 text-red-600">Erro ao carregar</div>
      <div className="text-sm text-gray-500 max-w-md mb-6">Tente novamente em alguns instantes.</div>
      <button 
        onClick={onVoltar} 
        className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        Voltar
      </button>
    </div>
  </div>
);

export const DetalheTurma = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [turma, setTurma] = useState<(Turma & { professorId: string }) | null>(null);
  const [professor, setProfessor] = useState<UsuarioPublico | null>(null);
  const [estado, setEstado] = useState<EstadoDetalhe>(id ? 'carregando' : 'nao-encontrada');

  useEffect(() => {
    if (!id) return undefined;
    let cancelado = false;

    const carregar = async () => {
      try {
        const turmaCarregada = await buscarTurma(id);
        if (cancelado) return;
        setTurma(turmaCarregada);

        try {
          const professorCarregado = await buscarUsuarioPorId(turmaCarregada.professorId);
          if (!cancelado) setProfessor(professorCarregado);
        } catch {
          if (!cancelado) setProfessor(null);
        }

        if (!cancelado) setEstado('sucesso');
      } catch (erro) {
        if (cancelado) return;
        setEstado(ehErroNaoEncontrado(erro) ? 'nao-encontrada' : 'erro');
      }
    };

    void carregar();
    return () => { cancelado = true; };
  }, [id]);

  const voltar = () => navigate('/aluno/turmas');

  if (estado === 'carregando') return <EstadoCarregando />;
  if (estado === 'erro') return <EstadoErro onVoltar={voltar} />;
  if (estado === 'nao-encontrada') return <EstadoNaoEncontrada onVoltar={voltar} />;

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#dde2ea]">
      <div className="bg-white border-b border-gray-200 py-4 px-7 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-bold text-lg text-gray-900">{turma?.nome}</h1>
          <p className="text-xs text-gray-500 mt-1">{turma?.descricao || 'Listas de exercícios publicadas pelo professor'}</p>
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-full py-1.5 px-3 text-sm font-bold text-gray-500 bg-white">
          <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center font-extrabold text-[10px] text-white">PF</div> 
          {professor?.nome || 'Professor'}
        </div>
      </div>

      <div className="p-6 md:p-7 overflow-y-auto flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <button type="button" className="cursor-pointer hover:text-teal-600 transition-colors bg-transparent border-none p-0 text-inherit font-inherit" onClick={voltar}>
            Minhas Turmas
          </button> 
          <span>›</span> 
          <span>{turma?.nome}</span> 
          <span>›</span> 
          <span className="text-gray-500 font-bold">Listas</span>
        </div>

        <ListagemListas turmaId={id!} />
      </div>
    </main>
  );
};