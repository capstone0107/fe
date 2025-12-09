import { useState, useEffect, useMemo } from 'react';
import './MainPage.css';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import ChatView from '../components/ChatView/ChatView';
import BookmarksView from '../components/BookmarksView/BookmarksView';
import VerifiedView from '../components/VerifiedView/VerifiedView';
import QuizView from '../components/QuizView/QuizView';
import DocumentView from '../components/DocumentView/DocumentView';
import SaveDialog from '../components/SaveDialog/SaveDialog';
import ConversationGraph from '../conversationGraph';
import { bookmarkAPI } from '../api/bookmark';
import type {
    Message,
    Source,
    BookmarkedSource,
    GroupedBookmarks,
    VerifiedConversation,
    ViewType,
    GraphData,
} from '../types';
import apiClient from '../api/client';

// UUID 생성 함수
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 샘플 대화 데이터
const SAMPLE_CONVERSATIONS: VerifiedConversation[] = [
    // ... (기존 샘플 데이터 유지)
];

function MainPage() {
    // View States
    const [currentView, setCurrentView] = useState<ViewType>('chat');
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

    // Chat States
    const [messages, setMessages] = useState<Message[]>([
        {
            id: generateId(),
            role: 'assistant',
            content:
                '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
            sources: [],
        },
    ]);
    const [loading, setLoading] = useState(false);

    // Conversation Selection States
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [selectedFocus, setSelectedFocus] = useState<string | null>(null);

    // Bookmark States
    const [bookmarks, setBookmarks] = useState<BookmarkedSource[]>([]);

    // Verified Conversation States
    const [verifiedConversations, setVerifiedConversations] = useState<VerifiedConversation[]>([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [conversationTitle, setConversationTitle] = useState('');

    // Graph States
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [isGraphLoading, setIsGraphLoading] = useState(false);
    const [isCombining, setIsCombining] = useState(false);

    useEffect(() => {
        startNewConversation();
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            const response = await bookmarkAPI.list(1, 100);
            const loadedBookmarks: BookmarkedSource[] = response.bookmarks.map((bm) => ({
                title: bm.title,
                url: bm.source_url,
                snippet: bm.summary,
                timestamp: new Date(bm.created_at).getTime(),
                question: '기타',
                knowledge_id: bm.knowledge_id,
            }));
            setBookmarks(loadedBookmarks);
        } catch (error) {
            console.error('북마크 로드 실패:', error);
        }
    };

    const startNewConversation = async () => {
        const newId = `auto-${Date.now()}`;
        try {
            const response = await apiClient.post<{ conversation_id: string }>('/search/start', {
                conversation_id: newId,
            });
            setCurrentConversationId(response.data.conversation_id);
        } catch (error) {
            console.error('대화 시작 실패:', error);
            setCurrentConversationId(newId);
        }
    };

    // Load saved data on mount
    useEffect(() => {
        const savedBookmarks = localStorage.getItem('bookmarks');
        if (savedBookmarks) {
            setBookmarks(JSON.parse(savedBookmarks));
        }

        const savedConversations = localStorage.getItem('verifiedConversations');
        if (savedConversations) {
            setVerifiedConversations(JSON.parse(savedConversations));
        } else {
            setVerifiedConversations(SAMPLE_CONVERSATIONS);
            localStorage.setItem('verifiedConversations', JSON.stringify(SAMPLE_CONVERSATIONS));
        }
    }, []);

    // 표시할 메시지 계산 (Focus 필터링)
    const displayedMessages = useMemo(() => {
        if (!selectedConversation) {
            return messages ?? [];
        }

        const conversation = verifiedConversations.find((c) => c.id === selectedConversation);
        if (!conversation) return [];

        if (selectedFocus === 'all') {
            return conversation.messages ?? [];
        }

        const focus = conversation.focuses?.find((f) => f.id === selectedFocus);
        if (!focus) return conversation.messages ?? [];

        return (conversation.messages ?? []).filter((msg) => focus.messageIds.includes(msg.id));
    }, [selectedConversation, selectedFocus, verifiedConversations, messages]);

    // Bookmark Management
    const findQuestionForSource = (source: Source): string => {
        for (let i = displayedMessages.length - 1; i >= 0; i--) {
            const msg = displayedMessages[i];
            if (msg.role === 'assistant' && msg.sources) {
                const hasSource = msg.sources.some(
                    (s) => s.title === source.title && s.url === source.url,
                );
                if (hasSource) {
                    for (let j = i - 1; j >= 0; j--) {
                        if (displayedMessages[j].role === 'user') {
                            return displayedMessages[j].content;
                        }
                    }
                }
            }
        }
        return '기타';
    };

    const toggleBookmark = async (source: Source) => {
        const sourceId = `${source.title}-${source.url}`;
        const isBookmarked = bookmarks.some((b) => `${b.title}-${b.url}` === sourceId);

        try {
            if (isBookmarked) {
                await apiClient.delete('/bookmarks', {
                    data: { title: source.title, url: source.url },
                });
                const newBookmarks = bookmarks.filter((b) => `${b.title}-${b.url}` !== sourceId);
                setBookmarks(newBookmarks);
                localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
            } else {
                const question = findQuestionForSource(source);
                await apiClient.post('/bookmarks', {
                    title: source.title,
                    source_url: source.url,
                    summary: source.snippet || '',
                    question: question,
                    knowledge_id: currentConversationId,
                    model_version: 'v1.0',
                });

                const newBookmarks = [
                    ...bookmarks,
                    { ...source, timestamp: Date.now(), question: question },
                ];
                setBookmarks(newBookmarks);
                localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
            }
        } catch (error) {
            console.error('북마크 처리 실패:', error);
            alert('북마크 처리에 실패했습니다.');
        }
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

    const handleSendMessage = async (input: string) => {
        if (selectedConversation) {
            setSelectedConversation(null);
            setSelectedFocus(null);
        }

        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: input,
        };
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            const response = await apiClient.post<{
                message_id: string;
                answer: string;
                sources: Source[];
            }>('/search/query', {
                conversation_id: currentConversationId,
                question: input,
            });

            const data = response.data;
            const assistantMessage: Message = {
                id: data.message_id,
                role: 'assistant',
                content: data.answer,
                sources: data.sources || [],
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: '죄송합니다. 오류가 발생했습니다.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConversation = async () => {
        if (!conversationTitle.trim()) return;

        const conversationMessages = messages.filter(
            (m) =>
                m.role !== 'assistant' ||
                m.content !==
                    '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
        );

        try {
            const response = await apiClient.post<{ focuses: any[] }>('/search/finalize', {
                conversation_id: currentConversationId,
                user_title: conversationTitle,
            });

            const newConversation: VerifiedConversation = {
                id: currentConversationId!,
                title: conversationTitle,
                messages: conversationMessages,
                timestamp: Date.now(),
                focuses: response.data.focuses || [],
            };

            const updatedConversations = [...verifiedConversations, newConversation];
            setVerifiedConversations(updatedConversations);
            localStorage.setItem('verifiedConversations', JSON.stringify(updatedConversations));

            setCurrentConversationId(null);
            setShowSaveDialog(false);
            setConversationTitle('');
            setMessages([
                {
                    id: generateId(),
                    role: 'assistant',
                    content:
                        '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
                    sources: [],
                },
            ]);
            setCurrentView('verified');
            await startNewConversation();
        } catch (error) {
            console.error('저장 실패:', error);
            alert('대화 저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleNewConversation = () => {
        setMessages([
            {
                id: generateId(),
                role: 'assistant',
                content:
                    '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
                sources: [],
            },
        ]);
        setSelectedConversation(null);
        setSelectedFocus(null);
        startNewConversation();
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

        if (conversation.messages) {
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
        }

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conversation.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFocusSelect = (conversationId: string, focusId: string) => {
        setSelectedConversation(conversationId);
        setSelectedFocus(focusId);
    };

    // Graph 관련 함수들
    const getOrGenerateGraph = async (conv: VerifiedConversation): Promise<GraphData | null> => {
        if (conv.graphData) return conv.graphData;
        if (conv.type === 'combined' || !conv.messages) return null;

        try {
            const response = await fetch('http://127.0.0.1:8000/graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conv.messages }),
            });
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const handleVisualize = async (conversation: VerifiedConversation) => {
        if (conversation.graphData) {
            setGraphData(conversation.graphData);
            setShowGraphModal(true);
            return;
        }

        setIsGraphLoading(true);
        setShowGraphModal(true);
        setGraphData(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversation.messages }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const newGraphData = await response.json();

            const updatedConversations = verifiedConversations.map((c) =>
                c.id === conversation.id ? { ...c, graphData: newGraphData } : c,
            );
            setVerifiedConversations(updatedConversations);
            localStorage.setItem('verifiedConversations', JSON.stringify(updatedConversations));

            setGraphData(newGraphData);
        } catch (error) {
            console.error('Error fetching graph:', error);
            alert('그래프를 불러오는데 실패했습니다.');
            setShowGraphModal(false);
        } finally {
            setIsGraphLoading(false);
        }
    };

    const handleCombine = async (selectedIds: string[]) => {
        if (selectedIds.length < 2) return;

        setIsGraphLoading(true);
        setShowGraphModal(true);
        setGraphData(null);
        setIsCombining(true);

        try {
            const selectedConvs = verifiedConversations.filter((c) => selectedIds.includes(c.id));
            const graphPromises = selectedConvs.map((conv) => getOrGenerateGraph(conv));
            const graphs = (await Promise.all(graphPromises)).filter(
                (g): g is GraphData => g !== null,
            );

            if (graphs.length < 2) {
                throw new Error('통합할 수 있는 유효한 그래프가 부족합니다.');
            }

            const response = await fetch('http://127.0.0.1:8000/graph/combined', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ graphs: graphs }),
            });

            if (!response.ok) throw new Error('Failed to combine');
            const combinedGraphData = await response.json();

            const newCombinedConv: VerifiedConversation = {
                id: `combined-${Date.now()}`,
                title: `🔗 통합: ${selectedConvs[0].title} 외 ${selectedConvs.length - 1}건`,
                timestamp: Date.now(),
                type: 'combined',
                sourceIds: selectedIds,
                graphData: combinedGraphData,
            };

            const updatedList = [newCombinedConv, ...verifiedConversations];
            setVerifiedConversations(updatedList);
            localStorage.setItem('verifiedConversations', JSON.stringify(updatedList));

            setGraphData(combinedGraphData);
        } catch (error) {
            console.error(error);
            alert('통합 그래프 생성 실패: ' + error);
            setShowGraphModal(false);
        } finally {
            setIsGraphLoading(false);
            setIsCombining(false);
        }
    };

    // 계산된 값들
    const groupedBookmarks = getGroupedBookmarks();
    const questionGroups = Object.keys(groupedBookmarks).sort((a, b) => {
        const latestA = Math.max(...groupedBookmarks[a].map((b) => b.timestamp));
        const latestB = Math.max(...groupedBookmarks[b].map((b) => b.timestamp));
        return latestB - latestA;
    });

    const currentMessageCount = messages.filter(
        (m) =>
            m.role !== 'assistant' ||
            m.content !==
                '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
    ).length;

    return (
        <div className="app">
            <Sidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                bookmarksCount={bookmarks.length}
                conversationsCount={verifiedConversations.length}
                hasConversationId={currentConversationId !== null}
                hasCurrentConversation={currentMessageCount > 0}
                currentMessageCount={currentMessageCount}
                isCurrentConversationSelected={!selectedConversation}
                onCurrentConversationSelect={() => {
                    setSelectedConversation(null);
                    setSelectedFocus(null);
                    setCurrentView('chat');
                }}
                savedConversations={verifiedConversations}
                selectedConversationId={selectedConversation}
                selectedFocusId={selectedFocus}
                onFocusSelect={handleFocusSelect}
                onNewConversation={handleNewConversation}
            />

            <main className="main">
                <Header
                    currentView={currentView}
                    showSaveButton={currentView === 'chat' && currentMessageCount > 0}
                    onSaveClick={() => setShowSaveDialog(true)}
                />

                {currentView === 'chat' && (
                    <ChatView
                        messages={displayedMessages}
                        loading={loading}
                        onSendMessage={handleSendMessage}
                        isBookmarked={isSourceBookmarked}
                        onToggleBookmark={toggleBookmark}
                        isViewingHistory={selectedConversation !== null}
                    />
                )}

                {currentView === 'bookmarks' && (
                    <BookmarksView
                        groupedBookmarks={groupedBookmarks}
                        questionGroups={questionGroups}
                        onToggleBookmark={toggleBookmark}
                    />
                )}

                {currentView === 'verified' && (
                    <VerifiedView
                        conversations={verifiedConversations}
                        onDelete={deleteConversation}
                        onDownload={downloadAsMarkdown}
                        onVisualize={handleVisualize}
                        onCombine={handleCombine}
                    />
                )}

                {currentView === 'quiz' && <QuizView />}
                {currentView === 'document' && <DocumentView />}
            </main>

            <SaveDialog
                isOpen={showSaveDialog}
                title={conversationTitle}
                onTitleChange={setConversationTitle}
                onSave={handleSaveConversation}
                onCancel={() => {
                    setShowSaveDialog(false);
                    setConversationTitle('');
                }}
            />

            {showGraphModal && (
                <div className="dialog-overlay" onClick={() => setShowGraphModal(false)}>
                    <div className="dialog graph-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>{isCombining ? '통합 지식 그래프' : '지식 그래프'}</h3>
                        <div className="graph-content">
                            {isGraphLoading ? (
                                <div className="loading-state">
                                    <div className="typing">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <p>
                                        {isCombining
                                            ? '여러 대화의 지식을 하나로 통합하고 있습니다...'
                                            : 'AI가 대화를 분석하여 그래프를 그리고 있습니다...'}
                                    </p>
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

export default MainPage;
