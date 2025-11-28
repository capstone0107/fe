export interface Message {
    id: string;  // 추가: 메시지 고유 ID
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
}

export interface Source {
    title: string;
    url: string;
    snippet?: string;
}

export interface BookmarkedSource extends Source {
    timestamp: number;
    question: string;
}

export interface GroupedBookmarks {
    [question: string]: BookmarkedSource[];
}

export interface ConversationFocus {
    id: string;
    name: string;
    messageIds: string[];  // 메시지 고유 ID 배열
    questionTags: string[];
}

export interface VerifiedConversation {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
    focuses?: ConversationFocus[];  // 추가: Focus 정보
}

export interface Quiz {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    sourceUrl: string;
    sourceTitle: string;
    relatedQuestion: string;
    timestamp: number;
    userAnswer?: number;
    isCorrect?: boolean;
}

export type ViewType = 'chat' | 'bookmarks' | 'verified' | 'quiz';

export interface ConversationMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    focusId: string;
    order: number;
}

export interface ConversationData {
    mainTopic: string;
    messages: ConversationMessage[];
    focuses: ConversationFocus[];
}

export type ConversationViewType = 'all' | string;