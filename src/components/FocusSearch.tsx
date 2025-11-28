import { useState } from 'react';
import './FocusSearch.css';
import type { SearchMatch } from '../types/focus';
import { FocusService } from '../services/focusService';

export function FocusSearch() {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<SearchMatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!keyword.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setHasSearched(true);
            const response = await FocusService.searchByKeyword(keyword);
            setResults(response.matches);
        } catch (err) {
            setError(err instanceof Error ? err.message : '검색 실패');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="focus-search-container">
            <div className="search-header">
                <h2>🔍 Focus 검색</h2>
            </div>

            <div className="search-input-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="키워드로 Focus 검색..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <button
                    className="search-btn"
                    onClick={handleSearch}
                    disabled={loading || !keyword.trim()}
                >
                    {loading ? '검색 중...' : '검색'}
                </button>
            </div>

            {error && (
                <div className="search-error">
                    <p>❌ {error}</p>
                </div>
            )}

            {hasSearched && !loading && !error && (
                <div className="search-results">
                    {results.length === 0 ? (
                        <div className="no-results">
                            <p>🔍 "{keyword}"에 대한 검색 결과가 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-header">
                                <h3>검색 결과 ({results.length}개)</h3>
                            </div>
                            <div className="results-list">
                                {results.map((match, idx) => (
                                    <SearchResultItem key={idx} match={match} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

interface SearchResultItemProps {
    match: SearchMatch;
}

function SearchResultItem({ match }: SearchResultItemProps) {
    return (
        <div className="search-result-item">
            <div className="result-header">
                <h4 className="result-title">{match.summary}</h4>
                <span className={`result-badge ${match.type}`}>
                    {match.type === 'focus' ? 'Focus' : 'Sub-focus'}
                </span>
            </div>
            <div className="result-meta">
                <span className="result-id">{match.focus_id}</span>
                <span className="separator">·</span>
                <span className="result-count">💬 {match.conversation_count}개 대화</span>
            </div>
            {match.keywords.length > 0 && (
                <div className="result-keywords">
                    {match.keywords.map((keyword, idx) => (
                        <span key={idx} className="keyword">
                            {keyword}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}