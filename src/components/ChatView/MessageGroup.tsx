import type { Message, Source } from '../../types';
import SourceCard from './SourceCard';

interface MessageGroupProps {
    message: Message;
    isBookmarked: (source: Source) => boolean;
    onToggleBookmark: (source: Source) => void;
}

export default function MessageGroup({
    message,
    isBookmarked,
    onToggleBookmark,
}: MessageGroupProps) {
    return (
        <div className="message-group">
            <div className={`message ${message.role}`}>
                <div className="message-bubble">
                    <p>{message.content}</p>
                </div>
            </div>

            {message.sources && message.sources.length > 0 && (
                <div className="cards-container">
                    <p className="cards-title">📚 참고 출처</p>
                    <div className="cards">
                        {message.sources.map((source, idx) => (
                            <SourceCard
                                key={idx}
                                source={source}
                                isBookmarked={isBookmarked(source)}
                                onToggleBookmark={onToggleBookmark}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
