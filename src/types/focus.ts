export interface FocusAssignment {
    focus_id: string;
    confidence: number;
    reason: string;
}

export interface ClassifyResponse {
    conversation_id: string;
    conversation_summary: string;
    focus_assignments: FocusAssignment[];
    classified_at: string;
    focuses: {  // 추가: 분류된 Focus 상세 정보
        id: string;
        name: string;
        messageIds: string[];
        questionTags: string[];
    }[];
}

export interface SubFocus {
    id: string;
    summary: string;
    keywords: string[];
    context: string;
    conversation_count: number;
    conversation_ids: string[];
}

export interface Focus {
    id: string;
    summary: string;
    keywords: string[];
    conversation_count: number;
    conversation_ids: string[];
    sub_focuses: { [key: string]: SubFocus };
}

export interface FocusData {
    focuses: { [key: string]: Focus };
    metadata: {
        total_focuses: number;
        total_sub_focuses: number;
        last_id: string;
    };
}

export interface SearchMatch {
    focus_id: string;
    summary: string;
    keywords: string[];
    conversation_count: number;
    type: 'focus' | 'sub-focus';
}

export interface SearchResponse {
    matches: SearchMatch[];
    keyword: string;
    count: number;
}