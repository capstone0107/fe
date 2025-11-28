// App.tsx
import { useState, useEffect, useMemo } from 'react';
import ConversationGraph from './conversationGraph';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import ChatView from './components/ChatView/ChatView';
import BookmarksView from './components/BookmarksView/BookmarksView';
import VerifiedView from './components/VerifiedView/VerifiedView';
import QuizView from './components/QuizView/QuizView';
import SaveDialog from './components/SaveDialog/SaveDialog';
import type {
    Message,
    Source,
    BookmarkedSource,
    GroupedBookmarks,
    VerifiedConversation,
    ViewType,
    Quiz,
    GraphData
} from './types';
import type { ConversationFocus, ConversationViewType } from './types/conversation';

// 샘플 Focus 데이터
const SAMPLE_FOCUSES: ConversationFocus[] = [
    {
        id: 'focus-cpu-scheduling',
        name: 'CPU 스케줄링 기술 최적화',
        messageIds: [1, 2, 3, 4],
        questionTags: ['FCFS 알고리즘', '병렬 처리 방법'],
    },
    {
        id: 'focus-memory-management',
        name: '메모리 관리',
        messageIds: [5, 6, 9, 10],
        questionTags: ['페이징 기법', '세그멘테이션'],
    },
    {
        id: 'focus-performance-analysis',
        name: '성능 분석',
        messageIds: [7, 8],
        questionTags: ['실시간 부하 측정'],
    },
];

const MAIN_TOPIC = '운영체제 관련 질의';

function App() {
    // View States
    const [currentView, setCurrentView] = useState<ViewType>('chat');
    const [focusView, setFocusView] = useState<ConversationViewType>('all');

    // Chat States
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
            sources: [],
        },
    ]);
    const [loading, setLoading] = useState(false);

    // Bookmark States
    const [bookmarks, setBookmarks] = useState<BookmarkedSource[]>([]);

    // Verified Conversation States
    const [verifiedConversations, setVerifiedConversations] = useState<VerifiedConversation[]>([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [conversationTitle, setConversationTitle] = useState('');

    // --- GRAPH STATES ---
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [graphData, setGraphData] = useState<any>(null);
    const [isGraphLoading, setIsGraphLoading] = useState(false);
    const [isCombining, setIsCombining] = useState(false); // New state for combination loading

    // Quiz States
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    // Load saved data on mount
    useEffect(() => {
        const savedBookmarks = localStorage.getItem('bookmarks');
        if (savedBookmarks) {
            setBookmarks(JSON.parse(savedBookmarks));
        }

        const savedConversations = localStorage.getItem('verifiedConversations');
        if (savedConversations) {
            setVerifiedConversations(JSON.parse(savedConversations));
        }

        const savedQuizzes = localStorage.getItem('quizzes');
        if (savedQuizzes) {
            setQuizzes(JSON.parse(savedQuizzes));
        }
    }, []);

    // Calculate total message count
    const totalMessageCount = useMemo(() => {
        return messages.filter(
            (m) =>
                m.role !== 'assistant' ||
                m.content !==
                    '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
        ).length;
    }, [messages]);

    // Bookmark Management
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

    // Chat Management
    const handleSendMessage = async (input: string) => {
        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            const conversationHistory = messages.map((m) => m.content);
            conversationHistory.push(input);

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

    // Verified Conversation Management
    const handleSaveConversation = () => {
        if (!conversationTitle.trim()) return;

        const newConversation: VerifiedConversation = {
            id: Date.now().toString(),
            title: conversationTitle,
            messages: messages.filter(
                (m) =>
                    m.role !== 'assistant' ||
                    m.content !==
                        '안녕하세요! 레빗홀과 함께 대화에서 시작되는 학습을 경험해보세요. 무엇이 궁금하신가요?',
            ),
            timestamp: Date.now(),
            type: 'single' // Explicitly mark as single
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

    // --- GRAPH: Visualize Single Graph ---
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
            const response = await fetch('http://localhost:8000/api/graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversation.messages }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const newGraphData = await response.json();
            
            // Save to cache
            const updatedConversations = verifiedConversations.map(c => 
                c.id === conversation.id ? { ...c, graphData: newGraphData } : c
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

    // --- GRAPH HELPER: Get or Generate Graph ---
    const getOrGenerateGraph = async (conv: VerifiedConversation): Promise<GraphData | null> => {
        if (conv.graphData) return conv.graphData;
        if (conv.type === 'combined' || !conv.messages) return null;

        try {
            const response = await fetch('http://localhost:8000/api/graph', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ messages: conv.messages })
            });
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    // --- GRAPH: Combine Selected Graphs ---
    const handleCombine = async (selectedIds: string[]) => {
        if (selectedIds.length < 2) return;

        setIsGraphLoading(true);
        setShowGraphModal(true);
        setGraphData(null);
        setIsCombining(true);

        try {
            const selectedConvs = verifiedConversations.filter(c => selectedIds.includes(c.id));
            
            // 1. Get graphs for all selected items (fetch if missing)
            const graphPromises = selectedConvs.map(conv => getOrGenerateGraph(conv));
            const graphs = (await Promise.all(graphPromises)).filter((g): g is GraphData => g !== null);

            if (graphs.length < 2) {
                throw new Error("통합할 수 있는 유효한 그래프가 부족합니다.");
            }

            // 2. Call Combined API
            const response = await fetch('http://localhost:8000/api/graph/combined', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ graphs: graphs }),
            });

            if (!response.ok) throw new Error('Failed to combine');
            const combinedGraphData = await response.json();

            // 3. Create a NEW VerifiedConversation item
            const newCombinedConv: VerifiedConversation = {
                id: `combined-${Date.now()}`,
                title: `🔗 통합: ${selectedConvs[0].title} 외 ${selectedConvs.length - 1}건`,
                timestamp: Date.now(),
                type: 'combined',
                sourceIds: selectedIds,
                graphData: combinedGraphData // Save directly
            };

            // 4. Save to List
            const updatedList = [newCombinedConv, ...verifiedConversations];
            setVerifiedConversations(updatedList);
            localStorage.setItem('verifiedConversations', JSON.stringify(updatedList));

            // 5. Show it
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

    // Quiz Management
    const handleAnswerQuiz = (quizId: string, answerIndex: number) => {
        const updatedQuizzes = quizzes.map((quiz) => {
            if (quiz.id === quizId) {
                return {
                    ...quiz,
                    userAnswer: answerIndex,
                    isCorrect: answerIndex === quiz.correctAnswer,
                };
            }
            return quiz;
        });

        setQuizzes(updatedQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    };

    const handleDeleteQuiz = (quizId: string) => {
        const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== quizId);
        setQuizzes(updatedQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    };

    // Prepare grouped bookmarks
    const groupedBookmarks = getGroupedBookmarks();
    const questionGroups = Object.keys(groupedBookmarks).sort((a, b) => {
        const latestA = Math.max(...groupedBookmarks[a].map((b) => b.timestamp));
        const latestB = Math.max(...groupedBookmarks[b].map((b) => b.timestamp));
        return latestB - latestA;
    });

    return (
        <div className="app">
            <Sidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                bookmarksCount={bookmarks.length}
                conversationsCount={verifiedConversations.length}
                mainTopic={MAIN_TOPIC}
                focuses={SAMPLE_FOCUSES}
                focusView={focusView}
                onFocusViewChange={setFocusView}
                totalMessageCount={totalMessageCount}
            />

            <main className="main">
                <Header
                    currentView={currentView}
                    showSaveButton={currentView === 'chat' && messages.length > 1}
                    onSaveClick={() => setShowSaveDialog(true)}
                />

                {currentView === 'chat' && (
                    <ChatView
                        messages={messages}
                        loading={loading}
                        onSendMessage={handleSendMessage}
                        isBookmarked={isSourceBookmarked}
                        onToggleBookmark={toggleBookmark}
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

                {currentView === 'quiz' && (
                    <QuizView
                        quizzes={quizzes}
                        onAnswerQuiz={handleAnswerQuiz}
                        onDeleteQuiz={handleDeleteQuiz}
                    />
                )}
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

            {/* Graph Modal */}
            {showGraphModal && (
                <div className="dialog-overlay" onClick={() => setShowGraphModal(false)}>
                    <div className="dialog graph-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>{isCombining ? "통합 지식 그래프" : "지식 그래프"}</h3>
                        <div className="graph-content">
                            {isGraphLoading ? (
                                <div className="loading-state">
                                    <div className="typing"><span></span><span></span><span></span></div>
                                    <p>{isCombining 
                                        ? "여러 대화의 지식을 하나로 통합하고 있습니다..." 
                                        : "AI가 대화를 분석하여 그래프를 그리고 있습니다..."}
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

export default App;