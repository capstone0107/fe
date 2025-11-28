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

export interface GraphData {
    nodes: { 
        id: string; 
        label: string; 
        description: string; 
        conversation_id?: string 
    }[];
    edges: { 
        source: string; 
        target: string; 
        label: string 
    }[];
}

export interface VerifiedConversation {
    id: string;
    title: string;
    timestamp: number;
    
    type?: 'single' | 'combined'; 
    messages?: Message[];         
    sourceIds?: string[];         
    graphData?: GraphData;        
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

// Focus Navigation 관련 타입 추가
export interface ConversationMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    focusId: string;
    order: number;
}

export interface ConversationFocus {
    id: string;
    name: string;
    messageIds: number[];
    questionTags: string[];
}

export interface ConversationData {
    mainTopic: string;
    messages: ConversationMessage[];
    focuses: ConversationFocus[];
}

export type ConversationViewType = 'all' | string;