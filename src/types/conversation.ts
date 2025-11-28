// src/types/conversation.ts

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