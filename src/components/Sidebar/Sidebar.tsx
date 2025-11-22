import './Sidebar.css';
import type { ViewType } from '../../types';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    bookmarksCount: number;
    conversationsCount: number;
}

export default function Sidebar({
    currentView,
    onViewChange,
    bookmarksCount,
    conversationsCount,
}: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">🐰</div>
                    <h1 className="logo">레빗홀</h1>
                </div>
                <p className="subtitle">대화에서 시작되는 출처 기반 학습</p>
            </div>

            <nav className="nav">
                <button
                    className={`nav-button ${currentView === 'chat' ? 'active' : ''}`}
                    onClick={() => onViewChange('chat')}
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
            </nav>

            <div className="sidebar-footer">
                <div className="info-box">
                    <p className="info-title">🔍 손쉬운 출처 탐색</p>
                    <p className="info-desc">답변의 근거를 직접 확인하세요.</p>
                </div>
            </div>
        </aside>
    );
}
