export interface Message {
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

export interface VerifiedConversation {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
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
