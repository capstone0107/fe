import apiClient from './client';

const API_PREFIX = '/documents';

export const documentAPI = {
    getAllDocuments: async () => {
        const response = await apiClient.get(`${API_PREFIX}`);
        return response.data;
    },

    deleteDocument: async (documentId: string) => {
        const response = await apiClient.delete(`${API_PREFIX}/${documentId}`);
        return response.data;
    },
};
