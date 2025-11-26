// App.tsx
import { useState, useRef, useEffect } from 'react';
import ConversationGraph from './conversationGraph';
import './App.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
}

interface Source {
    title: string;
    url: string;
    snippet?: string;
}

interface BookmarkedSource extends Source {
    timestamp: number;
    question: string;
}

interface GroupedBookmarks {
    [question: string]: BookmarkedSource[];
}

interface VerifiedConversation {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
}

function App() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
            sources: [],
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [bookmarks, setBookmarks] = useState<BookmarkedSource[]>([]);
    const [verifiedConversations, setVerifiedConversations] = useState<VerifiedConversation[]>([]);
    const [currentView, setCurrentView] = useState<'chat' | 'bookmarks' | 'verified'>('chat');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [conversationTitle, setConversationTitle] = useState('');

    const [showGraphModal, setShowGraphModal] = useState(false);
    const [graphData, setGraphData] = useState<any>(null); // Type as 'any' or define GraphData interface
    const [isGraphLoading, setIsGraphLoading] = useState(false);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const findQuestionForSource = (source: Source): string => {
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            if (msg.role === 'assistant' && msg.sources) {
                const hasSource = msg.sources.some(
                    (s) => s.title === source.title && s.url === source.url,
                );
                if (hasSource) {
                    for (let j = i - 1; j >= 0; j--) {
                        if (messages[j].role === 'user') {
                            return messages[j].content;
                        }
                    }
                }
            }
        }
        return '기타';
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

    useEffect(() => {
        const savedBookmarks = localStorage.getItem('bookmarks');
        if (savedBookmarks) {
            setBookmarks(JSON.parse(savedBookmarks));
        }

        const savedConversations = localStorage.getItem('verifiedConversations');
        if (savedConversations) {
            setVerifiedConversations(JSON.parse(savedConversations));
        }
    }, []);

    const toggleBookmark = (source: Source) => {
        const sourceId = `${source.title}-${source.url}`;
        const isBookmarked = bookmarks.some((b) => `${b.title}-${b.url}` === sourceId);

        let newBookmarks;
        if (isBookmarked) {
            newBookmarks = bookmarks.filter((b) => `${b.title}-${b.url}` !== sourceId);
        } else {
            const question = findQuestionForSource(source);
            newBookmarks = [
                ...bookmarks,
                {
                    ...source,
                    timestamp: Date.now(),
                    question: question,
                },
            ];
        }

        setBookmarks(newBookmarks);
        localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    };

    const isSourceBookmarked = (source: Source) => {
        const sourceId = `${source.title}-${source.url}`;
        return bookmarks.some((b) => `${b.title}-${b.url}` === sourceId);
    };

    const getGroupedBookmarks = (): GroupedBookmarks => {
        const grouped: GroupedBookmarks = {};

        bookmarks.forEach((bookmark) => {
            const question = bookmark.question || '기타';
            if (!grouped[question]) {
                grouped[question] = [];
            }
            grouped[question].push(bookmark);
        });

        Object.keys(grouped).forEach((key) => {
            grouped[key].sort((a, b) => b.timestamp - a.timestamp);
        });

        return grouped;
    };

    const handleSaveConversation = () => {
        if (!conversationTitle.trim()) return;

        const newConversation: VerifiedConversation = {
            id: Date.now().toString(),
            title: conversationTitle,
            messages: messages.filter(
                (m) =>
                    m.role !== 'assistant' ||
                    m.content !==
                        '안녕하세요! GPT-4o Search Preview 기반 AI 챗봇입니다. 무엇이 궁금하신가요?',
            ),
            timestamp: Date.now(),
        };

        const updatedConversations = [...verifiedConversations, newConversation];
        setVerifiedConversations(updatedConversations);
        localStorage.setItem('verifiedConversations', JSON.stringify(updatedConversations));

        setShowSaveDialog(false);
        setConversationTitle('');
        setCurrentView('verified');
    };

    const deleteConversation = (id: string) => {
        const updatedConversations = verifiedConversations.filter((c) => c.id !== id);
        setVerifiedConversations(updatedConversations);
        localStorage.setItem('verifiedConversations', JSON.stringify(updatedConversations));
    };

    const downloadAsMarkdown = (conversation: VerifiedConversation) => {
        let markdown = `# ${conversation.title}\n\n`;
        markdown += `*저장일: ${new Date(conversation.timestamp).toLocaleString('ko-KR')}*\n\n`;
        markdown += `---\n\n`;

        conversation.messages.forEach((msg) => {
            if (msg.role === 'user') {
                markdown += `## 👤 질문\n\n${msg.content}\n\n`;
            } else {
                markdown += `## 🤖 답변\n\n${msg.content}\n\n`;

                if (msg.sources && msg.sources.length > 0) {
                    markdown += `### 📚 참고 출처\n\n`;
                    msg.sources.forEach((source, idx) => {
                        markdown += `${idx + 1}. **${source.title}**\n`;
                        markdown += `   - URL: [${source.url}](${source.url})\n`;
                        if (source.snippet) {
                            markdown += `   - 요약: ${source.snippet}\n`;
                        }
                        markdown += `\n`;
                    });
                }
            }
        });

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conversation.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleVisualize = async (conversation: VerifiedConversation) => {
        setIsGraphLoading(true);
        setShowGraphModal(true); // Show modal with loading state immediately
        setGraphData(null); // Reset previous data

        try {
            const response = await fetch('http://localhost:8000/api/graph', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: conversation.messages,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Graph Data:', data);
            setGraphData(data);
        } catch (error) {
            console.error('Error fetching graph:', error);
            alert('그래프를 불러오는데 실패했습니다.');
            setShowGraphModal(false);
        } finally {
            setIsGraphLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const conversationHistory = messages.map((m) => m.content);
            conversationHistory.push(currentInput);

            // 새로운 search 엔드포인트 호출
            const response = await fetch('http://localhost:8000/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: conversationHistory,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data:', data);

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.answer,
                sources: data.sources || [],
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: '죄송합니다. 오류가 발생했습니다.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const groupedBookmarks = getGroupedBookmarks();
    const questionGroups = Object.keys(groupedBookmarks).sort((a, b) => {
        const latestA = Math.max(...groupedBookmarks[a].map((b) => b.timestamp));
        const latestB = Math.max(...groupedBookmarks[b].map((b) => b.timestamp));
        return latestB - latestA;
    });

    return (
        <div className="app">
            {/* Sidebar */}
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
                        onClick={() => setCurrentView('chat')}
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
                        onClick={() => setCurrentView('bookmarks')}
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
                        <span>북마크 ({bookmarks.length})</span>
                    </button>

                    <button
                        className={`nav-button ${currentView === 'verified' ? 'active' : ''}`}
                        onClick={() => setCurrentView('verified')}
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
                        <span>검증된 대화 ({verifiedConversations.length})</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="info-box">
                        <p className="info-title">🔍 손쉬운 출처 탐색</p>
                        <p className="info-desc">답변의 근거를 직접 확인하세요.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main">
                <header className="header">
                    <h2>
                        {currentView === 'chat'
                            ? '챗봇'
                            : currentView === 'bookmarks'
                            ? '북마크'
                            : '대화 내용'}
                    </h2>
                    {currentView === 'chat' && messages.length > 1 && (
                        <button
                            className="save-conversation-btn"
                            onClick={() => setShowSaveDialog(true)}
                        >
                            대화 저장
                        </button>
                    )}
                </header>

                {currentView === 'chat' && (
                    <div className="chat-container">
                        <div className="messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className="message-group">
                                    <div className={`message ${msg.role}`}>
                                        <div className="message-bubble">
                                            <p>{msg.content}</p>
                                        </div>
                                    </div>

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="cards-container">
                                            <p className="cards-title">📚 참고 출처</p>
                                            <div className="cards">
                                                {msg.sources.map((source, sourceIdx) => (
                                                    <div key={sourceIdx} className="card">
                                                        <div className="card-content">
                                                            <p className="card-title">
                                                                {source.title}
                                                            </p>
                                                            {source.snippet && (
                                                                <p className="card-summary">
                                                                    {source.snippet}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="card-footer">
                                                            <button
                                                                className={`bookmark-button ${
                                                                    isSourceBookmarked(source)
                                                                        ? 'bookmarked'
                                                                        : ''
                                                                }`}
                                                                onClick={() =>
                                                                    toggleBookmark(source)
                                                                }
                                                                title={
                                                                    isSourceBookmarked(source)
                                                                        ? '북마크 해제'
                                                                        : '북마크 추가'
                                                                }
                                                            >
                                                                {isSourceBookmarked(source)
                                                                    ? '★'
                                                                    : '☆'}
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
                                    )}
                                </div>
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
                                    onClick={sendMessage}
                                    disabled={loading || !input.trim()}
                                    className="send-button"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'bookmarks' && (
                    <div className="bookmarks-view">
                        <h3>저장된 출처</h3>
                        {bookmarks.length === 0 ? (
                            <p className="empty-message">저장된 북마크가 없습니다.</p>
                        ) : (
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
                                                            <p className="card-summary">
                                                                {source.snippet}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="card-footer">
                                                        <button
                                                            className="bookmark-button bookmarked"
                                                            onClick={() => toggleBookmark(source)}
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
                        )}
                    </div>
                )}

                {currentView === 'verified' && (
                    <div className="verified-view">
                        <h3>저장된 대화</h3>
                        {verifiedConversations.length === 0 ? (
                            <p className="empty-message">저장된 대화가 없습니다.</p>
                        ) : (
                            <div className="verified-list">
                                {verifiedConversations
                                    .sort((a, b) => b.timestamp - a.timestamp)
                                    .map((conv) => (
                                        <div key={conv.id} className="verified-item">
                                            <div className="verified-header">
                                                <h4>{conv.title}</h4>
                                                <div className="verified-actions">
                                                    {/* New Visualize Button */}
                                                    <button 
                                                        className="action-btn visualize"
                                                        onClick={() => handleVisualize(conv)}
                                                        title="지식 그래프 보기"
                                                    >
                                                        {/* Network/Graph Icon */}
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                                                    <button
                                                        className="action-btn download"
                                                        onClick={() => downloadAsMarkdown(conv)}
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
                                                        onClick={() => deleteConversation(conv.id)}
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
                                                        <strong>
                                                            {msg.role === 'user'
                                                                ? '질문:'
                                                                : '답변:'}
                                                        </strong>
                                                        <span>
                                                            {msg.content.substring(0, 100)}...
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="dialog-overlay" onClick={() => setShowSaveDialog(false)}>
                    <div className="dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>대화 저장</h3>
                        <p className="dialog-desc">이 대화 내용을 검증된 대화로 저장합니다.</p>
                        <input
                            type="text"
                            className="dialog-input"
                            placeholder="대화 제목을 입력하세요"
                            value={conversationTitle}
                            onChange={(e) => setConversationTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveConversation();
                                }
                            }}
                            autoFocus
                        />
                        <div className="dialog-actions">
                            <button
                                className="dialog-btn cancel"
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setConversationTitle('');
                                }}
                            >
                                취소
                            </button>
                            <button
                                className="dialog-btn confirm"
                                onClick={handleSaveConversation}
                                disabled={!conversationTitle.trim()}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Graph Modal (NEW) */}
            {showGraphModal && (
                <div className="dialog-overlay" onClick={() => setShowGraphModal(false)}>
                    <div className="dialog graph-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>지식 그래프</h3>
                        <div className="graph-content">
                            {isGraphLoading ? (
                                <div className="loading-state">
                                    <div className="typing"><span></span><span></span><span></span></div>
                                    <p>AI가 대화를 분석하여 그래프를 그리고 있습니다...</p>
                                </div>
                            ) : graphData ? (
                                <ConversationGraph 
                                    data={graphData} 
                                    onClose={() => setShowGraphModal(false)} 
                                />
                            ) : (
                                <p className="error-message">데이터를 불러오지 못했습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

