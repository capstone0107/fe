import apiClient from './client';

const API_PREFIX = '/documents';

export const documentAPI = {
    getDocuments: async () => {
        const response = await apiClient.get(API_PREFIX);
        return response.data;
    },
};
