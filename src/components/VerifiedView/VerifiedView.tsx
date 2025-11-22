import './VerifiedView.css';
import type { VerifiedConversation } from '../../types';

interface VerifiedViewProps {
    conversations: VerifiedConversation[];
    onDelete: (id: string) => void;
    onDownload: (conversation: VerifiedConversation) => void;
}

export default function VerifiedView({ conversations, onDelete, onDownload }: VerifiedViewProps) {
    if (conversations.length === 0) {
        return (
            <div className="verified-view">
                <h3>저장된 대화</h3>
                <p className="empty-message">저장된 대화가 없습니다.</p>
            </div>
        );
    }

    const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="verified-view">
            <h3>저장된 대화</h3>
            <div className="verified-list">
                {sortedConversations.map((conv) => (
                    <div key={conv.id} className="verified-item">
                        <div className="verified-header">
                            <h4>{conv.title}</h4>
                            <div className="verified-actions">
                                <button
                                    className="action-btn download"
                                    onClick={() => onDownload(conv)}
                                    title="마크다운으로 다운로드"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                        />
                                    </svg>
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => onDelete(conv.id)}
                                    title="삭제"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <p className="verified-date">
                            {new Date(conv.timestamp).toLocaleString('ko-KR')}
                        </p>
                        <div className="verified-preview">
                            {conv.messages.slice(0, 2).map((msg, idx) => (
                                <div key={idx} className="preview-message">
                                    <strong>{msg.role === 'user' ? '질문:' : '답변:'}</strong>
                                    <span>{msg.content.substring(0, 100)}...</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
