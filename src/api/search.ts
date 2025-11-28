import apiClient from './client';

export const searchAPI = {
    search: async (question: string[]) => {
        const response = await apiClient.post('/api/search', { question });
        return response.data;
    },
};
