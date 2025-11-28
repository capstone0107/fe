import type { Source } from '../../types';

interface SourceCardProps {
    source: Source;
    isBookmarked: boolean;
    onToggleBookmark: (source: Source) => void;
}

export default function SourceCard({ source, isBookmarked, onToggleBookmark }: SourceCardProps) {
    return (
        <div className="card">
            <div className="card-content">
                <p className="card-title">{source.title}</p>
                {source.snippet && <p className="card-summary">{source.snippet}</p>}
            </div>
            <div className="card-footer">
                <button
                    className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={() => onToggleBookmark(source)}
                    title={isBookmarked ? '북마크 해제' : '북마크 추가'}
                >
                    {isBookmarked ? '★' : '☆'}
                </button>
                <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-link"
                >
                    원문 보기
                </a>
            </div>
        </div>
    );
}
