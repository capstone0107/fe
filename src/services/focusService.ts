import type { ClassifyResponse, FocusData, Focus, SearchResponse } from '../types/focus';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Message {
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
        const response = await fetch(`${API_BASE_URL}/focus/classify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                messages: messages,
            }),
        });

        if (!response.ok) {
            throw new Error(`분류 실패: ${response.status}`);
        }

        return response.json();
    }

    /**
     * 전체 Focus 조회
     */
    static async getAllFocuses(): Promise<FocusData> {
        const response = await fetch(`${API_BASE_URL}/focus/all`);

        if (!response.ok) {
            throw new Error(`Focus 조회 실패: ${response.status}`);
        }

        return response.json();
    }

    /**
     * 특정 Focus 조회
     */
    static async getFocus(focusId: string): Promise<{ focus: Focus; type: string }> {
        const response = await fetch(`${API_BASE_URL}/focus/${focusId}`);

        if (!response.ok) {
            throw new Error(`Focus 조회 실패: ${response.status}`);
        }

        return response.json();
    }

    /**
     * 키워드 검색
     */
    static async searchByKeyword(keyword: string): Promise<SearchResponse> {
        const response = await fetch(`${API_BASE_URL}/focus/search/keyword/${encodeURIComponent(keyword)}`);

        if (!response.ok) {
            throw new Error(`검색 실패: ${response.status}`);
        }

        return response.json();
    }
}