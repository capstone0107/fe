import apiClient from './client';

export interface BookmarkCreateRequest {
    knowledge_id: string;
    source_url: string;
    title: string;
    summary: string;
    model_version?: string;
}

export interface BookmarkResponse {
    id: number;
    user_id: number;
    knowledge_id: string;
    source_url: string;
    title: string;
    summary: string;
    model_version: string | null;
    created_at: string;
}

export interface BookmarkListResponse {
    bookmarks: BookmarkResponse[];
    total: number;
    page: number;
    page_size: number;
}

export interface BookmarkUpdateRequest {
    title?: string;
    summary?: string;
}

export const bookmarkAPI = {
    // 북마크 생성
    create: async (data: BookmarkCreateRequest): Promise<BookmarkResponse> => {
        const response = await apiClient.post<BookmarkResponse>('/bookmarks', data);
        return response.data;
    },

    // 북마크 목록 조회
    list: async (page: number = 1, pageSize: number = 20): Promise<BookmarkListResponse> => {
        const response = await apiClient.get<BookmarkListResponse>('/bookmarks', {
            params: { page, page_size: pageSize },
        });
        return response.data;
    },

    // 북마크 검색
    search: async (
        keyword: string,
        page: number = 1,
        pageSize: number = 20,
    ): Promise<BookmarkListResponse> => {
        const response = await apiClient.get<BookmarkListResponse>('/bookmarks/search', {
            params: { keyword, page, page_size: pageSize },
        });
        return response.data;
    },

    // 특정 북마크 조회
    get: async (bookmarkId: number): Promise<BookmarkResponse> => {
        const response = await apiClient.get<BookmarkResponse>(`/bookmarks/${bookmarkId}`);
        return response.data;
    },

    // 북마크 수정
    update: async (
        bookmarkId: number,
        data: BookmarkUpdateRequest,
    ): Promise<BookmarkResponse> => {
        const response = await apiClient.patch<BookmarkResponse>(`/bookmarks/${bookmarkId}`, data);
        return response.data;
    },

    // 북마크 삭제
    delete: async (bookmarkId: number): Promise<void> => {
        await apiClient.delete(`/bookmarks/${bookmarkId}`);
    },
};