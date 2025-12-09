import { useState, useEffect } from 'react';
import './Sidebar.css';
import type { ViewType, VerifiedConversation } from '../../types';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    bookmarksCount: number;
    conversationsCount: number;

    // 현재 대화 관련
    hasCurrentConversation: boolean;
    currentMessageCount: number;
    isCurrentConversationSelected: boolean;
    onCurrentConversationSelect: () => void;
    hasConversationId: boolean; // ⭐ 추가: conversation ID 존재 여부

    // 저장된 대화 목록
    savedConversations: VerifiedConversation[];
    selectedConversationId: string | null;
    selectedFocusId: string | null;
    onFocusSelect: (conversationId: string, focusId: string) => void;
    onNewConversation: () => void;
}

export default function Sidebar({
    currentView,
    onViewChange,
    bookmarksCount,
    conversationsCount,
    hasCurrentConversation,
    currentMessageCount,
    isCurrentConversationSelected,
    onCurrentConversationSelect,
    hasConversationId, // ⭐ 추가
    savedConversations,
    selectedConversationId,
    selectedFocusId,
    onFocusSelect,
    onNewConversation,
}: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <img src="/logo.png" alt="레빗홀 로고" className="logo-icon" />
                    <h1 className="logo">레빗홀</h1>
                </div>
                <p className="subtitle">대화에서 시작되는 출처 기반 학습</p>
            </div>

            {/* 기본 네비게이션 */}
            <nav className="nav">
                {/* ⭐ [개선됨] conversation ID가 있으면 새로 생성하지 않음 */}
                <button
                    className={`nav-button ${currentView === 'chat' ? 'active' : ''}`}
                    onClick={() => {
                        if (hasConversationId) {
                            // conversation ID가 이미 있으면 뷰만 전환
                            onViewChange('chat');
                        } else {
                            // conversation ID가 없으면 새 대화 생성
                            onNewConversation();
                            onViewChange('chat');
                        }
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                    <span>챗봇</span>
                </button>

                <button
                    className={`nav-button ${currentView === 'bookmarks' ? 'active' : ''}`}
                    onClick={() => onViewChange('bookmarks')}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                    </svg>
                    <span>북마크 ({bookmarksCount})</span>
                </button>

                <button
                    className={`nav-button ${currentView === 'verified' ? 'active' : ''}`}
                    onClick={() => onViewChange('verified')}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>검증된 대화 ({conversationsCount})</span>
                </button>

                <button
                    className={`nav-button ${currentView === 'quiz' ? 'active' : ''}`}
                    onClick={() => onViewChange('quiz')}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                    </svg>
                    <span>퀴즈</span>
                </button>
                <button
                    className={`nav-button ${currentView === 'document' ? 'active' : ''}`}
                    onClick={() => onViewChange('document')}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <span>도큐먼트</span>
                </button>
            </nav>

            {/* 대화 목록 섹션 */}
            <div className="conversation-list-section">
                <div className="conversation-list-header">
                    <span className="conversation-list-title">대화 목록</span>
                </div>

                <div className="conversation-list">
                    {/* 현재 대화 */}
                    {hasCurrentConversation && (
                        <button
                            className={`conversation-item ${
                                isCurrentConversationSelected ? 'active' : ''
                            }`}
                            onClick={onCurrentConversationSelect}
                        >
                            <div className="conversation-item-content">
                                <div className="conversation-item-header">
                                    <span className="conversation-item-title">현재 대화</span>
                                    <span className="conversation-item-count">
                                        {currentMessageCount}개
                                    </span>
                                </div>
                                <span className="conversation-item-badge">진행 중</span>
                            </div>
                        </button>
                    )}

                    {/* 저장된 대화 목록 */}
                    {savedConversations
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((conversation) => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                isSelected={selectedConversationId === conversation.id}
                                selectedFocusId={selectedFocusId}
                                onFocusSelect={onFocusSelect}
                            />
                        ))}
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="info-box">
                    <p className="info-title">🔍 손쉬운 출처 탐색</p>
                    <p className="info-desc">답변의 근거를 직접 확인하세요.</p>
                </div>
            </div>
        </aside>
    );
}

// ConversationItem 및 하위 컴포넌트는 기존 코드 유지
interface ConversationItemProps {
    conversation: VerifiedConversation;
    isSelected: boolean;
    selectedFocusId: string | null;
    onFocusSelect: (conversationId: string, focusId: string) => void;
}

function ConversationItem({
    conversation,
    isSelected,
    selectedFocusId,
    onFocusSelect,
}: ConversationItemProps) {
    const [isExpanded, setIsExpanded] = useState(isSelected);

    useEffect(() => {
        if (isSelected) {
            setIsExpanded(true);
        }
    }, [isSelected]);

    const hasFocuses = conversation.focuses && conversation.focuses.length > 0;

    return (
        <div className="conversation-item-wrapper">
            <button
                className={`conversation-item ${isSelected && !selectedFocusId ? 'active' : ''}`}
                onClick={() => {
                    if (hasFocuses) {
                        setIsExpanded(!isExpanded);
                    }
                    onFocusSelect(conversation.id, 'all');
                }}
            >
                <div className="conversation-item-content">
                    <div className="conversation-item-header">
                        <span className="conversation-item-title">{conversation.title}</span>
                        {hasFocuses && (
                            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                        )}
                    </div>
                    <span className="conversation-item-badge">
                        {new Date(conversation.timestamp).toLocaleDateString('ko-KR')} ·{' '}
                        {conversation.messages?.length ?? 0}개 메시지
                    </span>
                </div>
            </button>

            {/* Focus 목록 */}
            {isExpanded && hasFocuses && (
                <div className="focus-list">
                    {conversation.focuses!.map((focus) => (
                        <button
                            key={focus.id}
                            className={`focus-item ${
                                isSelected && selectedFocusId === focus.id ? 'active' : ''
                            }`}
                            onClick={() => onFocusSelect(conversation.id, focus.id)}
                        >
                            <div className="focus-item-content">
                                <div className="focus-item-header">
                                    <span className="focus-item-title">{focus.name}</span>
                                    <span className="focus-item-count">
                                        {focus.messageIds.length}개
                                    </span>
                                </div>
                                {focus.questionTags.length > 0 && (
                                    <div className="focus-item-tags">
                                        {focus.questionTags.map((tag, idx) => (
                                            <span key={idx} className="focus-tag">
                                                "{tag}"
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
