import { useState } from 'react';
import './VerifiedView.css';
import type { VerifiedConversation } from '../../types';

interface VerifiedViewProps {
    conversations: VerifiedConversation[];
    onDelete: (id: string) => void;
    onDownload: (conversation: VerifiedConversation) => void;
    onVisualize: (conversation: VerifiedConversation) => void;
    onCombine: (selectedIds: string[]) => void;
}

export default function VerifiedView({ 
    conversations, 
    onDelete, 
    onDownload, 
    onVisualize,
    onCombine 
}: VerifiedViewProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    if (conversations.length === 0) {
        return (
            <div className="verified-view">
                <h3>저장된 대화</h3>
                <p className="empty-message">저장된 대화가 없습니다.</p>
            </div>
        );
    }

    const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const handleCombineClick = () => {
        if (selectedIds.size < 2) return;
        onCombine(Array.from(selectedIds));
        setSelectedIds(new Set());
    };

    return (
        <div className="verified-view">
            {/* Header with Combine Button */}
            <div className="verified-view-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>저장된 대화</h3>
                
                <button 
                    className="combine-action-btn"
                    onClick={handleCombineClick}
                    disabled={selectedIds.size < 2}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: selectedIds.size < 2 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: selectedIds.size < 2 ? 0.5 : 1, // Dim if disabled
                        transition: 'opacity 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </svg>
                    {selectedIds.size < 2 ? "대화 통합하기 (2개 이상 선택)" : `${selectedIds.size}개 대화 통합하기`}
                </button>
            </div>
            
            <div className="verified-list">
                {sortedConversations.map((conv) => (
                    <div key={conv.id} className={`verified-item ${selectedIds.has(conv.id) ? 'selected' : ''}`} style={{ display: 'flex', gap: '12px' }}>
                        
                        {/* Checkbox Section */}
                        <div className="selection-checkbox" style={{ paddingTop: '6px' }}>
                            <input 
                                type="checkbox" 
                                checked={selectedIds.has(conv.id)}
                                onChange={() => toggleSelection(conv.id)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#8b5cf6' }}
                            />
                        </div>

                        {/* Content Section */}
                        <div className="verified-item-content" style={{ flex: 1 }}>
                            <div className="verified-header">
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {conv.type === 'combined' && <span title="통합된 지식">🔗</span>}
                                    {conv.title}
                                </h4>
                                <div className="verified-actions">
                                    {/* Visualize Button */}
                                    <button 
                                        className="action-btn visualize"
                                        onClick={() => onVisualize(conv)}
                                        title="지식 그래프 보기"
                                        style={{ color: '#8b5cf6' }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="6" cy="6" r="3"></circle>
                                            <circle cx="6" cy="18" r="3"></circle>
                                            <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                                            <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                                            <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
                                            <circle cx="18" cy="18" r="3"></circle>
                                            <circle cx="18" cy="6" r="3"></circle>
                                            <line x1="6" y1="9" x2="6" y2="15"></line>
                                        </svg>
                                    </button>

                                    {/* Download (Only for single chats) */}
                                    {conv.type !== 'combined' && (
                                        <button
                                            className="action-btn download"
                                            onClick={() => onDownload(conv)}
                                            title="마크다운으로 다운로드"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                            </svg>
                                        </button>
                                    )}
                                    
                                    <button
                                        className="action-btn delete"
                                        onClick={() => onDelete(conv.id)}
                                        title="삭제"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <p className="verified-date">
                                {new Date(conv.timestamp).toLocaleString('ko-KR')}
                            </p>
                            
                            {/* Message Preview (Safety Checked) */}
                            {conv.type !== 'combined' && conv.messages && (
                                <div className="verified-preview">
                                    {conv.messages.slice(0, 2).map((msg, idx) => (
                                        <div key={idx} className="preview-message">
                                            <strong>{msg.role === 'user' ? '질문:' : '답변:'}</strong>
                                            <span>{msg.content.substring(0, 100)}...</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Combined Graph Summary */}
                            {conv.type === 'combined' && (
                                <div className="verified-preview">
                                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                                        {conv.sourceIds?.length}개의 대화가 통합되었습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}