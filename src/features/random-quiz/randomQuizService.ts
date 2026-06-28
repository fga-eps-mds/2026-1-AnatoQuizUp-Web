// Servico do quiz avulso (random quiz) do aluno. Busca questoes do quiz, envia a
// resposta de uma questao (recebendo o feedback de acerto/erro), consulta o saldo
// de moedas e a quantidade de questoes disponiveis por tema.
import { httpClient } from '../../shared/api/httpClient';
import type { QuestionListParams } from '../manage-questions';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type { ListQuizQuestionResponse, QuantidadeQuestoesTema, QuantidadeQuestoesTemaResponse, QuestaoQuizAnwser, QuestaoQuizFeedback, SaldoMoedasResponse } from './types';

// Prefixo base das rotas do quiz.
const QUIZ_ENDPOINT = '/quiz';

// GET /quiz — busca as questoes do quiz (filtros opcionais por tema/dificuldade etc.).
export const buscarQuestoesQuiz = async (
    params?: QuestionListParams
): Promise<ListQuizQuestionResponse> => {
    try{
        const { data } = await httpClient.get<ListQuizQuestionResponse>(
            `${QUIZ_ENDPOINT}`, 
            { params },
        );
        return data;
    }
    catch (error) {
        throw new Error(extractErrorMessage(error));
    }
}

// POST /quiz/responder — envia a resposta de uma questao e recebe o feedback.
export const responderQuestaoQuiz = async (
    params?: QuestaoQuizAnwser
): Promise<QuestaoQuizFeedback> => {
    try {
        const { data } = await httpClient.post<QuestaoQuizFeedback>(
            `${QUIZ_ENDPOINT}/responder`,
            params 
        );
        return data
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
}

// GET /quiz/moedas — consulta o saldo de moedas ATP do aluno.
export const buscarSaldoMoedas = async (): Promise<SaldoMoedasResponse> => {
    try {
        const { data } = await httpClient.get<SaldoMoedasResponse>(
            `${QUIZ_ENDPOINT}/moedas`
        );
        return data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
}

// GET /quiz/quantidade_por_tema — quantas questoes existem em cada tema.
export const buscarQuantidadeDeQuestoesPorTema = async():
Promise<QuantidadeQuestoesTema[]> => {
  try {
    const { data } =
      await httpClient.get<QuantidadeQuestoesTemaResponse>(
        `${QUIZ_ENDPOINT}/quantidade_por_tema`,
      );

    return data.quantidadeDeQuestoesPorTema;

  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
