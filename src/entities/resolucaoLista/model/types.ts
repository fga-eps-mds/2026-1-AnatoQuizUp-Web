// Tipos de dominio da resolucao de listas pelo aluno (resumo, questao e detalhe).

// Estados possiveis de uma lista do ponto de vista do aluno.
export type StatusResolucao = 'PENDENTE' | 'RESPONDIDA' | 'EXPIRADA' | 'EM_ANDAMENTO' | 'SUBMETIDA';

// Resumo de uma lista exibido na listagem do aluno.
export interface ResumoListaAluno {
  listaTurmaId: string;
  nome: string;
  temas: string[];
  quantidadeQuestoes: number;
  prazo: string | null;
  status: StatusResolucao;
  gabaritoLiberado: boolean;
}

// Questao como vista pelo aluno ao resolver a lista (com resposta marcada e,
// se o gabarito estiver liberado, a correta e o "saiba mais").
export interface QuestaoAluno {
  id: string;
  enunciado: string;
  urlImagem: string | null;
  tema: string;
  tipoQuestao: string;
  alternativas: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  } | null;
  respostaMarcada: string | null;
  respostaCorreta?: string;
  saibaMais?: string | null;
  tipo: 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO';
}

// Detalhe completo de uma lista do aluno, com suas questoes.
export interface DetalhesListaAluno {
  id: string;
  nome: string;
  prazo: string | null;
  gabaritoLiberado: boolean;
  status: StatusResolucao;
  questoes: QuestaoAluno[];
}