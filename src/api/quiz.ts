import apiClient from './client';

const API_PREFIX = '/quiz';

export const quizAPI = {
    getQuizById: async (quizId: string) => {
        const response = await apiClient.get(`${API_PREFIX}/${quizId}`);
        return response.data;
    },

    deleteQuiz: async (quizId: string) => {
        const response = await apiClient.delete(`${API_PREFIX}/${quizId}`);
        return response.data;
    },
};
