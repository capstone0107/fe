import './Header.css';
import type { ViewType } from '../../types';

interface HeaderProps {
    currentView: ViewType;
    showSaveButton: boolean;
    onSaveClick: () => void;
}

export default function Header({ currentView, showSaveButton, onSaveClick }: HeaderProps) {
    const titles = {
        chat: '챗봇',
        bookmarks: '북마크',
        verified: '대화 내용',
        quiz: '퀴즈',
        document: '도큐먼트',
    };

    return (
        <header className="header">
            <h2>{titles[currentView]}</h2>
            {showSaveButton && (
                <button className="save-conversation-btn" onClick={onSaveClick}>
                    대화 저장
                </button>
            )}
        </header>
    );
}
