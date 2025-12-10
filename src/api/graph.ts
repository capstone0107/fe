// src/api/graph.ts
import apiClient from './client';
import type { GraphData, Message } from '../types';

export const graphAPI = {
    // 단일 대화 그래프 생성
    generateGraph: async (messages: Message[]): Promise<GraphData> => {
        const response = await apiClient.post<GraphData>('/graph', {
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        });
        return response.data;
    },

    // 여러 그래프 통합
    combineGraphs: async (graphs: GraphData[]): Promise<GraphData> => {
        const response = await apiClient.post<GraphData>('/graph/combined', {
            graphs: graphs
        });
        return response.data;
    }
};