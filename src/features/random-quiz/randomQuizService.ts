import { httpClient } from '../../shared/api/httpClient';
import type { QuestionListParams } from '../manage-questions';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type { ListQuizQuestionResponse, QuantidadeQuestoesTema, QuantidadeQuestoesTemaResponse, QuestaoQuizAnwser, QuestaoQuizFeedback } from './types';

const QUIZ_ENDPOINT = '/quiz';

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