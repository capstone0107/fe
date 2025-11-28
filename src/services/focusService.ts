import apiClient from '../api/client';
import type { ClassifyResponse, FocusData, Focus, SearchResponse } from '../types/focus';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export class FocusService {
    /**
     * 대화 분류 API 호출
     */
    static async classifyConversation(
        conversationId: string,
        messages: Message[]
    ): Promise<ClassifyResponse> {
        console.log("Classifying conversation with ID:", conversationId);
        console.log("Messages:", messages);

        // apiClient의 baseURL이 'http://127.0.0.1:8000/'이므로 '/api' prefix를 붙여줍니다.
        const response = await apiClient.post<ClassifyResponse>('/api/focus/classify', {
            conversation_id: conversationId,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            })),
        });

        return response.data;
    }

    /**
     * 전체 Focus 조회
     */
    static async getAllFocuses(): Promise<FocusData> {
        const response = await apiClient.get<FocusData>('/api/focus/all');
        return response.data;
    }

    /**
     * 특정 Focus 조회
     */
    static async getFocus(focusId: string): Promise<{ focus: Focus; type: string }> {
        const response = await apiClient.get<{ focus: Focus; type: string }>(`/api/focus/${focusId}`);
        return response.data;
    }

    /**
     * 키워드 검색
     */
    static async searchByKeyword(keyword: string): Promise<SearchResponse> {
        const response = await apiClient.get<SearchResponse>(`/api/focus/search/keyword/${encodeURIComponent(keyword)}`);
        return response.data;
    }
}