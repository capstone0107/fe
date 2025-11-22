import { useState, useRef, useEffect } from 'react';
import './ChatView.css';
import type { Message, Source } from '../../types';
import MessageGroup from './MessageGroup';

interface ChatViewProps {
    messages: Message[];
    loading: boolean;
    onSendMessage: (message: string) => void;
    isBookmarked: (source: Source) => boolean;
    onToggleBookmark: (source: Source) => void;
}

export default function ChatView({
    messages,
    loading,
    onSendMessage,
    isBookmarked,
    onToggleBookmark,
}: ChatViewProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleSend = () => {
        if (!input.trim() || loading) return;
        onSendMessage(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <MessageGroup
                        key={idx}
                        message={msg}
                        isBookmarked={isBookmarked}
                        onToggleBookmark={onToggleBookmark}
                    />
                ))}

                {loading && (
                    <div className="message-group">
                        <div className="message assistant">
                            <div className="message-bubble">
                                <div className="typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <div className="input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="무엇이든 질문해보세요..."
                        disabled={loading}
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="send-button"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
