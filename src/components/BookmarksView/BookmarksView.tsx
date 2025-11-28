import './BookmarksView.css';
import type { GroupedBookmarks, Source } from '../../types';

interface BookmarksViewProps {
    groupedBookmarks: GroupedBookmarks;
    questionGroups: string[];
    onToggleBookmark: (source: Source) => void;
}

export default function BookmarksView({
    groupedBookmarks,
    questionGroups,
    onToggleBookmark,
}: BookmarksViewProps) {
    if (Object.keys(groupedBookmarks).length === 0) {
        return (
            <div className="bookmarks-view">
                <h3>저장된 출처</h3>
                <p className="empty-message">저장된 북마크가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="bookmarks-view">
            <h3>저장된 출처</h3>
            <div className="bookmark-groups">
                {questionGroups.map((question, groupIdx) => (
                    <div key={groupIdx} className="bookmark-group">
                        <h4 className="group-title">
                            <span className="question-icon">Q</span>
                            {question}
                        </h4>
                        <div className="cards">
                            {groupedBookmarks[question].map((source, idx) => (
                                <div key={idx} className="card">
                                    <div className="card-content">
                                        <p className="card-title">{source.title}</p>
                                        {source.snippet && (
                                            <p className="card-summary">{source.snippet}</p>
                                        )}
                                    </div>
                                    <div className="card-footer">
                                        <button
                                            className="bookmark-button bookmarked"
                                            onClick={() => onToggleBookmark(source)}
                                            title="북마크 해제"
                                        >
                                            ★
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
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
