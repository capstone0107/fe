import { useState, useEffect, useMemo } from 'react';
import './MainPage.css';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import ChatView from '../components/ChatView/ChatView';
import BookmarksView from '../components/BookmarksView/BookmarksView';
import VerifiedView from '../components/VerifiedView/VerifiedView';
import QuizView from '../components/QuizView/QuizView';
import SaveDialog from '../components/SaveDialog/SaveDialog';
import ConversationGraph from '../conversationGraph';
import { bookmarkAPI } from '../api/bookmark'; // ⭐ 이 줄 추가
import type {
    Message,
    Source,
    BookmarkedSource,
    GroupedBookmarks,
    VerifiedConversation,
    ViewType,
    Quiz,
    GraphData,
} from '../types';
import apiClient from '../api/client';

// UUID 생성 함수
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 샘플 대화 데이터
const SAMPLE_CONVERSATIONS: VerifiedConversation[] = [
    {
        id: 'sample-conv-1',
        title: '운영체제 관련 질의',
        timestamp: Date.now() - 86400000 * 2, // 2일 전
        messages: [
            {
                id: 'msg-1',
                role: 'user',
                content: 'FCFS 스케줄링 알고리즘에 대해 설명해주세요.',
            },
            {
                id: 'msg-2',
                role: 'assistant',
                content:
                    'FCFS(First-Come, First-Served)는 가장 간단한 CPU 스케줄링 알고리즘입니다. 프로세스가 준비 큐에 도착한 순서대로 CPU를 할당받습니다. 구현이 간단하지만 convoy effect가 발생할 수 있습니다.',
                sources: [
                    {
                        title: '운영체제 - CPU 스케줄링',
                        url: 'https://example.com/os-scheduling',
                        snippet: 'FCFS는 비선점형 스케줄링 방식입니다.',
                    },
                ],
            },
            {
                id: 'msg-3',
                role: 'user',
                content: '병렬 처리는 어떻게 구현하나요?',
            },
            {
                id: 'msg-4',
                role: 'assistant',
                content:
                    '병렬 처리는 여러 프로세스나 스레드가 동시에 실행되는 것을 의미합니다. 멀티코어 프로세서에서 각 코어가 독립적으로 작업을 수행하거나, 분산 시스템에서 여러 컴퓨터가 협력하여 작업을 처리합니다.',
            },
            {
                id: 'msg-5',
                role: 'user',
                content: '페이징 기법에 대해 알려주세요.',
            },
            {
                id: 'msg-6',
                role: 'assistant',
                content:
                    '페이징은 프로세스의 주소 공간을 고정된 크기의 페이지로 나누고, 물리 메모리를 같은 크기의 프레임으로 나누어 관리하는 메모리 관리 기법입니다. 외부 단편화를 해결할 수 있습니다.',
                sources: [
                    {
                        title: '메모리 관리 - 페이징',
                        url: 'https://example.com/memory-paging',
                        snippet: '페이징은 논리 주소를 물리 주소로 변환합니다.',
                    },
                ],
            },
            {
                id: 'msg-7',
                role: 'user',
                content: '시스템의 실시간 부하를 어떻게 측정하나요?',
            },
            {
                id: 'msg-8',
                role: 'assistant',
                content:
                    '시스템 부하는 top, htop, vmstat 같은 명령어나 모니터링 도구를 사용하여 측정할 수 있습니다. CPU 사용률, 메모리 사용량, 디스크 I/O, 네트워크 트래픽 등을 모니터링합니다.',
            },
            {
                id: 'msg-9',
                role: 'user',
                content: '세그멘테이션은 무엇인가요?',
            },
            {
                id: 'msg-10',
                role: 'assistant',
                content:
                    '세그멘테이션은 프로세스의 주소 공간을 논리적 단위인 세그먼트로 나누는 메모리 관리 기법입니다. 각 세그먼트는 코드, 데이터, 스택 등 의미 있는 단위로 구성됩니다.',
            },
        ],
        focuses: [
            {
                id: 'focus-cpu-scheduling',
                name: 'CPU 스케줄링 기술 최적화',
                messageIds: ['msg-1', 'msg-2', 'msg-3', 'msg-4'],
                questionTags: ['FCFS 알고리즘', '병렬 처리 방법'],
            },
            {
                id: 'focus-memory-management',
                name: '메모리 관리',
                messageIds: ['msg-5', 'msg-6', 'msg-9', 'msg-10'],
                questionTags: ['페이징 기법', '세그멘테이션'],
            },
            {
                id: 'focus-performance-analysis',
                name: '성능 분석',
                messageIds: ['msg-7', 'msg-8'],
                questionTags: ['실시간 부하 측정'],
            },
        ],
    },
    {
        id: 'sample-conv-2',
        title: 'React Hook 학습',
        timestamp: Date.now() - 86400000 * 1, // 1일 전
        messages: [
            {
                id: 'msg-11',
                role: 'user',
                content: 'useState는 어떻게 사용하나요?',
            },
            {
                id: 'msg-12',
                role: 'assistant',
                content:
                    'useState는 함수형 컴포넌트에서 상태를 관리하는 Hook입니다. const [state, setState] = useState(initialValue) 형태로 사용하며, state는 현재 상태 값이고 setState는 상태를 업데이트하는 함수입니다.',
                sources: [
                    {
                        title: 'React 공식 문서 - useState',
                        url: 'https://react.dev/reference/react/useState',
                        snippet: 'useState는 컴포넌트에 상태 변수를 추가합니다.',
                    },
                ],
            },
            {
                id: 'msg-13',
                role: 'user',
                content: 'useEffect의 의존성 배열은 왜 필요한가요?',
            },
            {
                id: 'msg-14',
                role: 'assistant',
                content:
                    '의존성 배열은 effect가 언제 다시 실행될지 결정합니다. 배열에 포함된 값이 변경될 때만 effect가 재실행되므로, 불필요한 실행을 방지하고 성능을 최적화할 수 있습니다.',
            },
            {
                id: 'msg-15',
                role: 'user',
                content: 'useEffect 클린업 함수는 언제 사용하나요?',
            },
            {
                id: 'msg-16',
                role: 'assistant',
                content:
                    '클린업 함수는 컴포넌트가 언마운트되거나 effect가 다시 실행되기 전에 실행됩니다. 타이머 정리, 이벤트 리스너 제거, WebSocket 연결 종료 등에 사용됩니다.',
                sources: [
                    {
                        title: 'React Hook 패턴',
                        url: 'https://example.com/react-hooks',
                        snippet: '클린업 함수로 리소스를 정리합니다.',
                    },
                ],
            },
            {
                id: 'msg-17',
                role: 'user',
                content: 'useMemo와 useCallback의 차이는?',
            },
            {
                id: 'msg-18',
                role: 'assistant',
                content:
                    'useMemo는 계산된 값을 메모이제이션하고, useCallback은 함수를 메모이제이션합니다. useMemo는 값을 반환하고 useCallback은 함수를 반환한다는 차이가 있습니다.',
            },
        ],
        focuses: [
            {
                id: 'focus-useState',
                name: 'useState 사용법',
                messageIds: ['msg-11', 'msg-12'],
                questionTags: ['상태 관리', '초기값'],
            },
            {
                id: 'focus-useEffect',
                name: 'useEffect 패턴',
                messageIds: ['msg-13', 'msg-14', 'msg-15', 'msg-16'],
                questionTags: ['의존성 배열', '클린업 함수'],
            },
            {
                id: 'focus-optimization',
                name: '성능 최적화',
                messageIds: ['msg-17', 'msg-18'],
                questionTags: ['useMemo', 'useCallback'],
            },
        ],
    },
    {
        id: 'sample-conv-3',
        title: '데이터베이스 최적화',
        timestamp: Date.now() - 86400000 * 5, // 5일 전
        messages: [
            {
                id: 'msg-19',
                role: 'user',
                content: '인덱스는 어떻게 작동하나요?',
            },
            {
                id: 'msg-20',
                role: 'assistant',
                content:
                    '인덱스는 데이터베이스 테이블의 검색 속도를 높이기 위한 자료구조입니다. B-Tree나 Hash 같은 구조를 사용하여 데이터의 물리적 위치를 빠르게 찾을 수 있습니다.',
                sources: [
                    {
                        title: 'Database Indexing',
                        url: 'https://example.com/db-index',
                        snippet: '인덱스는 검색 성능을 크게 향상시킵니다.',
                    },
                ],
            },
            {
                id: 'msg-21',
                role: 'user',
                content: '복합 인덱스를 만들 때 컬럼 순서가 중요한가요?',
            },
            {
                id: 'msg-22',
                role: 'assistant',
                content:
                    '네, 매우 중요합니다. 복합 인덱스는 왼쪽부터 순서대로 사용되므로, 가장 자주 사용되거나 선택도가 높은 컬럼을 앞에 배치해야 합니다.',
            },
            {
                id: 'msg-23',
                role: 'user',
                content: '쿼리 실행 계획은 어떻게 확인하나요?',
            },
            {
                id: 'msg-24',
                role: 'assistant',
                content:
                    'EXPLAIN 명령어를 사용하여 쿼리 실행 계획을 확인할 수 있습니다. 어떤 인덱스가 사용되는지, 몇 개의 행이 스캔되는지 등의 정보를 제공합니다.',
            },
        ],
        focuses: [
            {
                id: 'focus-index-strategy',
                name: '인덱스 전략',
                messageIds: ['msg-19', 'msg-20', 'msg-21', 'msg-22'],
                questionTags: ['B-Tree', '복합 인덱스'],
            },
            {
                id: 'focus-query-optimization',
                name: '쿼리 최적화',
                messageIds: ['msg-23', 'msg-24'],
                questionTags: ['실행 계획', 'EXPLAIN'],
            },
        ],
    },
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

    const [showGraphModal, setShowGraphModal] = useState(false);
    const [graphData, setGraphData] = useState<any>(null);
    const [isGraphLoading, setIsGraphLoading] = useState(false);
    const [isCombining, setIsCombining] = useState(false); // New state for combination loading

    // Quiz States
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

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
            console.log('✅ 북마크 로드 완료:', loadedBookmarks.length, '개');
        } catch (error) {
            console.error('북마크 로드 실패:', error);
        } finally {
        }
    };

    const startNewConversation = async () => {
        const newId = `auto-${Date.now()}`;

        try {
            // ⭐ apiClient로 변경
            const response = await apiClient.post<{ conversation_id: string }>('/search/start', {
                conversation_id: newId,
            });

            const data = response.data;
            setCurrentConversationId(data.conversation_id);
            console.log('✨ 새 대화 시작:', data.conversation_id);
        } catch (error) {
            console.error('대화 시작 실패:', error);
            // fallback: 로컬에서 ID 생성
            setCurrentConversationId(newId);
        }
    };

    const toggleBookmark = async (source: Source) => {
        const sourceId = `${source.title}-${source.url}`;
        const isBookmarked = bookmarks.some((b) => `${b.title}-${b.url}` === sourceId);

        try {
            if (isBookmarked) {
                // 북마크 제거
                await apiClient.delete('/bookmarks', {
                    data: {
                        title: source.title,
                        url: source.url,
                    },
                });

                const newBookmarks = bookmarks.filter((b) => `${b.title}-${b.url}` !== sourceId);
                setBookmarks(newBookmarks);
                localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
            } else {
                // 북마크 추가 - 사용자 질문도 함께 전송
                const question = findQuestionForSource(source);
                console.log('관련 질문 찾음:', question);
                await apiClient.post('/bookmarks', {
                    title: source.title,
                    source_url: source.url,
                    summary: source.snippet || '',
                    question: question, // ✅ 사용자 질문 추가
                    knowledge_id: currentConversationId,
                    model_version: 'v1.0', // 예시 모델 버전
                });

                const newBookmarks = [
                    ...bookmarks,
                    {
                        ...source,
                        timestamp: Date.now(),
                        question: question,
                    },
                ];

                setBookmarks(newBookmarks);
                localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
            }
        } catch (error) {
            console.error('북마크 처리 실패:', error);
            alert('북마크 처리에 실패했습니다.');
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
            console.log('💾 저장된 대화 데이터를 로드합니다...');
            setVerifiedConversations(JSON.parse(savedConversations));
        } else {
            // localStorage가 비어있으면 샘플 데이터 사용
            console.log('📚 샘플 대화 데이터를 로드합니다...');
            setVerifiedConversations(SAMPLE_CONVERSATIONS);
            localStorage.setItem('verifiedConversations', JSON.stringify(SAMPLE_CONVERSATIONS));
        }

        const savedQuizzes = localStorage.getItem('quizzes');
        if (savedQuizzes) {
            setQuizzes(JSON.parse(savedQuizzes));
        }
    }, []);

    // 표시할 메시지 계산 (Focus 필터링)
    const displayedMessages = useMemo(() => {
        // 현재 대화 모드
        if (!selectedConversation) {
            return messages ?? []; // Safety check just in case 'messages' state is undefined
        }

        // 저장된 대화 선택됨
        const conversation = verifiedConversations.find((c) => c.id === selectedConversation);
        if (!conversation) return [];

        // 전체 대화 보기
        if (selectedFocus === 'all') {
            return conversation.messages ?? [];
        }

        // 특정 Focus 필터링
        const focus = conversation.focuses?.find((f) => f.id === selectedFocus);
        if (!focus) return conversation.messages ?? [];

        // Focus의 messageIds에 해당하는 메시지만 필터링
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
            // ⭐ apiClient로 변경
            const response = await apiClient.post<{
                message_id: string;
                answer: string;
                sources: Source[];
            }>('/search/query', {
                conversation_id: currentConversationId,
                question: input,
            });

            // axios는 !response.ok 체크 불필요 (에러 시 catch로 이동)
            const data = response.data;

            // ⭐ message_id는 백엔드에서 생성됨
            const assistantMessage: Message = {
                id: data.message_id, // 백엔드에서 받은 ID 사용
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
            // ⭐ apiClient로 변경
            // focuses 타입 추론을 위해 any 또는 구체적 타입 사용 가능
            const response = await apiClient.post<{ focuses: any[] }>('/search/finalize', {
                conversation_id: currentConversationId,
                user_title: conversationTitle,
            });

            const data = response.data;
            console.log('✅ 대화 저장 완료:', data);

            // 새로운 대화 객체 생성
            const newConversation: VerifiedConversation = {
                id: currentConversationId!,
                title: conversationTitle,
                messages: conversationMessages,
                timestamp: Date.now(),
                focuses: data.focuses || [],
            };

            const updatedConversations = [...verifiedConversations, newConversation];
            setVerifiedConversations(updatedConversations);
            localStorage.setItem('verifiedConversations', JSON.stringify(updatedConversations));

            // 상태 초기화 및 새 대화 시작
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

            // 새 대화 시작
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
        console.log('Clicked Conversation ID:', conversationId); // 요구사항 2
        console.log('Clicked Focus ID:', focusId); // 요구사항 2

        setSelectedConversation(conversationId);
        setSelectedFocus(focusId);

        // setCurrentView('chat'); // 요구사항 1: 대화창 활성화(화면 전환) 코드 제거
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

            // Save to cache
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

    // --- GRAPH HELPER: Get or Generate Graph ---
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

    // --- GRAPH: Combine Selected Graphs ---
    const handleCombine = async (selectedIds: string[]) => {
        if (selectedIds.length < 2) return;

        setIsGraphLoading(true);
        setShowGraphModal(true);
        setGraphData(null);
        setIsCombining(true);

        try {
            const selectedConvs = verifiedConversations.filter((c) => selectedIds.includes(c.id));

            // 1. Get graphs for all selected items (fetch if missing)
            const graphPromises = selectedConvs.map((conv) => getOrGenerateGraph(conv));
            const graphs = (await Promise.all(graphPromises)).filter(
                (g): g is GraphData => g !== null,
            );

            if (graphs.length < 2) {
                throw new Error('통합할 수 있는 유효한 그래프가 부족합니다.');
            }

            // 2. Call Combined API
            const response = await fetch('http://127.0.0.1:8000/graph/combined', {
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
                graphData: combinedGraphData, // Save directly
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

    // 현재 대화의 메시지 수 (초기 인사말 제외)
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
                // 저장된 대화 목록
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
