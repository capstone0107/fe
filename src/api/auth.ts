import apiClient from './client';

const API_PREFIX = '/users';

export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await apiClient.post(API_PREFIX + '/login', { email, password });
        return response.data;
    },

    signup: async (email: string, password: string, username: string) => {
        const response = await apiClient.post(API_PREFIX + '/signup', {
            email,
            password,
            username,
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('authToken');
    },
};
