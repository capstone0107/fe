// src/components/FocusNavigation/FocusNavigation.tsx

import './FocusNavigation.css';
import type { ConversationFocus, ConversationViewType } from '../../types/conversation';

interface FocusNavigationProps {
    mainTopic: string;
    focuses: ConversationFocus[];
    currentView: ConversationViewType;
    onViewChange: (view: ConversationViewType) => void;
}

export default function FocusNavigation({
    mainTopic,
    focuses,
    currentView,
    onViewChange,
}: FocusNavigationProps) {
    return (
        <aside className="sidebar-focus">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">🐰</div>
                    <h1 className="logo">레빗홀</h1>
                </div>
                <p className="subtitle">대화에서 시작되는 출처 기반 학습</p>
            </div>

            <div className="conversation-nav">
                {/* Main Topic - Show All Conversations */}
                <div className="main-topic-section">
                    <button
                        className={`topic-button ${currentView === 'all' ? 'active' : ''}`}
                        onClick={() => onViewChange('all')}
                    >
                        <div className="topic-info">
                            <span className="topic-title">{mainTopic}</span>
                            <span className="conversation-badge">전체 대화</span>
                        </div>
                    </button>
                </div>

                {/* Focus Items */}
                <div className="focuses-section">
                    {focuses.map((focus) => (
                        <div key={focus.id} className="focus-item">
                            <button
                                className={`focus-button ${
                                    currentView === focus.id ? 'active' : ''
                                }`}
                                onClick={() => onViewChange(focus.id)}
                            >
                                <div className="focus-header">
                                    <span className="focus-count">
                                        {focus.questionTags.length}개 질문
                                    </span>
                                </div>
                                <div className="focus-name">{focus.name}</div>
                                <div className="focus-questions">
                                    {focus.questionTags.map((tag, idx) => (
                                        <span key={idx} className="question-tag">
                                            "{tag}"
                                        </span>
                                    ))}
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}