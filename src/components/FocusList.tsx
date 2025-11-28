import { useState, useEffect } from 'react';

import './FocusList.css';
import type { Focus, FocusData, SubFocus } from '../types/focus';
import { FocusService } from '../services/focusService';

export function FocusList() {
    const [focusData, setFocusData] = useState<FocusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedFocus, setExpandedFocus] = useState<string | null>(null);

    useEffect(() => {
        loadFocuses();
    }, []);

    const loadFocuses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await FocusService.getAllFocuses();
            setFocusData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류');
        } finally {
            setLoading(false);
        }
    };

    const toggleFocus = (focusId: string) => {
        setExpandedFocus(expandedFocus === focusId ? null : focusId);
    };

    if (loading) {
        return (
            <div className="focus-list-container">
                <div className="loading">Focus 목록을 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="focus-list-container">
                <div className="error">
                    <p>❌ {error}</p>
                    <button onClick={loadFocuses} className="retry-btn">
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    if (!focusData || Object.keys(focusData.focuses).length === 0) {
        return (
            <div className="focus-list-container">
                <div className="empty">
                    <p>📭 아직 분류된 Focus가 없습니다.</p>
                    <p className="empty-hint">대화를 저장하면 자동으로 Focus가 생성됩니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="focus-list-container">
            <div className="focus-header">
                <h2>📚 Focus 목록</h2>
                <div className="focus-stats">
                    <span>총 {focusData.metadata.total_focuses}개 Focus</span>
                    <span>·</span>
                    <span>{focusData.metadata.total_sub_focuses}개 Sub-focus</span>
                </div>
                <button onClick={loadFocuses} className="refresh-btn" title="새로고침">
                    🔄
                </button>
            </div>

            <div className="focus-list">
                {Object.entries(focusData.focuses).map(([id, focus]) => (
                    <FocusItem
                        key={id}
                        focus={focus}
                        isExpanded={expandedFocus === id}
                        onToggle={() => toggleFocus(id)}
                    />
                ))}
            </div>
        </div>
    );
}

interface FocusItemProps {
    focus: Focus;
    isExpanded: boolean;
    onToggle: () => void;
}

function FocusItem({ focus, isExpanded, onToggle }: FocusItemProps) {
    const hasSubFocuses = Object.keys(focus.sub_focuses).length > 0;

    return (
        <div className="focus-item">
            <div className="focus-main" onClick={onToggle}>
                <div className="focus-info">
                    <h3 className="focus-title">
                        {hasSubFocuses && (
                            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                        )}
                        {focus.summary}
                    </h3>
                    <div className="focus-meta">
                        <span className="conversation-count">
                            💬 {focus.conversation_count}개 대화
                        </span>
                        {focus.keywords.length > 0 && (
                            <div className="keywords">
                                {focus.keywords.slice(0, 3).map((keyword, idx) => (
                                    <span key={idx} className="keyword">
                                        {keyword}
                                    </span>
                                ))}
                                {focus.keywords.length > 3 && (
                                    <span className="keyword more">+{focus.keywords.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && hasSubFocuses && (
                <div className="sub-focuses">
                    {Object.entries(focus.sub_focuses).map(([id, subFocus]) => (
                        <SubFocusItem key={id} subFocus={subFocus} />
                    ))}
                </div>
            )}
        </div>
    );
}

interface SubFocusItemProps {
    subFocus: SubFocus;
}

function SubFocusItem({ subFocus }: SubFocusItemProps) {
    return (
        <div className="sub-focus-item">
            <div className="sub-focus-header">
                <h4 className="sub-focus-title">{subFocus.summary}</h4>
                <span className="sub-focus-count">💬 {subFocus.conversation_count}</span>
            </div>
            {subFocus.context && <p className="sub-focus-context">{subFocus.context}</p>}
            {subFocus.keywords.length > 0 && (
                <div className="keywords">
                    {subFocus.keywords.map((keyword, idx) => (
                        <span key={idx} className="keyword small">
                            {keyword}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}