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
    id?: number; // 백엔드 북마크 ID (서버에서 관리)
    timestamp: number;
    question: string;
    knowledge_id?: string; // 지식 카드 ID (conversation_id + message_id)
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

export interface ConversationFocus {
    id: string;
    name: string;
    messageIds: string[];  // 메시지 고유 ID 배열
    questionTags: string[];
}

export interface Conversation {
    id: string;
    title?: string;  // optional로 변경
    isSaved: boolean;  // ✅ 추가: 저장 여부
    messageCount: number;
    timestamp: number;
}

export interface VerifiedConversation {
    id: string;
    title: string;
    timestamp: number;
    
    type?: 'single' | 'combined'; 
    messages?: Message[];         
    sourceIds?: string[];         
    graphData?: GraphData;        
    focuses?: ConversationFocus[];
    isSaved?: boolean;  // ✅ 추가: 저장 여부 플래그
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