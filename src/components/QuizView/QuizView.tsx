import { useState, useEffect } from 'react';
import './QuizView.css';
import type { Quiz } from '../../types';

interface QuizViewProps {
    quizzes: Quiz[];
    onAnswerQuiz: (quizId: string, answerIndex: number) => void;
    onDeleteQuiz: (quizId: string) => void;
}

const MOCK_QUIZZES = [
    {
        question: '인공지능의 학습 방식 중 레이블이 있는 데이터로 학습하는 방법은?',
        options: ['지도 학습', '비지도 학습', '강화 학습', '전이 학습'],
        correctAnswer: 0,
        explanation:
            '지도 학습(Supervised Learning)은 레이블이 있는 학습 데이터를 사용하여 입력과 출력 간의 관계를 학습하는 방법입니다. 정답이 주어진 데이터로 학습하기 때문에 분류나 회귀 문제에 주로 사용됩니다.',
        sourceUrl: 'https://ko.wikipedia.org/wiki/지도_학습',
        sourceTitle: '위키백과 - 지도 학습',
        relatedQuestion: '인공지능의 학습 방식에는 어떤 것들이 있나요?',
    },
    {
        question: 'React에서 상태 관리를 위해 사용하는 Hook은?',
        options: ['useEffect', 'useState', 'useContext', 'useMemo'],
        correctAnswer: 1,
        explanation:
            'useState는 함수형 컴포넌트에서 상태를 관리하기 위한 React Hook입니다. useState를 호출하면 현재 상태 값과 그 값을 업데이트하는 함수를 반환합니다.',
        sourceUrl: 'https://react.dev/reference/react/useState',
        sourceTitle: 'React 공식 문서 - useState',
        relatedQuestion: 'React Hook에 대해 알려주세요',
    },
    {
        question: '블록체인의 핵심 특징이 아닌 것은?',
        options: ['탈중앙화', '투명성', '변경 가능성', '보안성'],
        correctAnswer: 2,
        explanation:
            '블록체인의 핵심 특징은 탈중앙화, 투명성, 불변성(변경 불가능성), 보안성입니다. 한 번 기록된 데이터는 변경할 수 없는 것이 블록체인의 중요한 특징입니다.',
        sourceUrl: 'https://ko.wikipedia.org/wiki/블록체인',
        sourceTitle: '위키백과 - 블록체인',
        relatedQuestion: '블록체인 기술에 대해 설명해주세요',
    },
    {
        question: 'HTTP 메서드 중 서버의 리소스를 생성할 때 주로 사용하는 것은?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 1,
        explanation:
            'POST 메서드는 서버에 새로운 리소스를 생성할 때 주로 사용됩니다. GET은 조회, PUT은 수정, DELETE는 삭제에 사용됩니다.',
        sourceUrl: 'https://developer.mozilla.org/ko/docs/Web/HTTP/Methods',
        sourceTitle: 'MDN - HTTP 요청 메서드',
        relatedQuestion: 'RESTful API에서 HTTP 메서드는 어떻게 사용하나요?',
    },
    {
        question: 'Python에서 리스트의 마지막 요소를 제거하고 반환하는 메서드는?',
        options: ['remove()', 'pop()', 'delete()', 'clear()'],
        correctAnswer: 1,
        explanation:
            'pop() 메서드는 리스트의 마지막 요소를 제거하고 그 값을 반환합니다. 인자를 전달하면 해당 인덱스의 요소를 제거할 수도 있습니다.',
        sourceUrl: 'https://docs.python.org/ko/3/tutorial/datastructures.html',
        sourceTitle: 'Python 공식 문서 - 자료 구조',
        relatedQuestion: 'Python 리스트의 주요 메서드에는 무엇이 있나요?',
    },
    {
        question: '데이터베이스의 ACID 속성 중 원자성(Atomicity)의 의미는?',
        options: [
            '트랜잭션의 모든 연산이 완전히 수행되거나 전혀 수행되지 않아야 함',
            '트랜잭션이 성공적으로 완료되면 그 결과가 영구적으로 반영됨',
            '동시에 실행되는 트랜잭션들이 서로 영향을 미치지 않음',
            '트랜잭션 실행 전후에 데이터베이스가 일관된 상태를 유지함',
        ],
        correctAnswer: 0,
        explanation:
            '원자성(Atomicity)은 트랜잭션의 모든 연산이 완전히 수행되거나, 아니면 전혀 수행되지 않아야 한다는 의미입니다. All or Nothing 원칙이라고도 합니다.',
        sourceUrl: 'https://ko.wikipedia.org/wiki/ACID',
        sourceTitle: '위키백과 - ACID',
        relatedQuestion: '데이터베이스의 트랜잭션 특성에 대해 알려주세요',
    },
];

export default function QuizView({ quizzes, onAnswerQuiz, onDeleteQuiz }: QuizViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [displayQuizzes, setDisplayQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        if (quizzes.length === 0) {
            const mockQuizzes: Quiz[] = MOCK_QUIZZES.map((quiz, idx) => ({
                ...quiz,
                id: `mock-${idx}`,
                timestamp: Date.now() + idx,
                userAnswer: undefined,
                isCorrect: undefined,
            }));
            setDisplayQuizzes(mockQuizzes);
        } else {
            setDisplayQuizzes(quizzes);
        }
    }, [quizzes]);

    const currentQuiz = displayQuizzes[currentIndex];
    const completedQuizzes = displayQuizzes.filter((q) => q.userAnswer !== undefined);
    const correctCount = completedQuizzes.filter((q) => q.isCorrect).length;
    const isLastQuiz = currentIndex === displayQuizzes.length - 1;

    useEffect(() => {
        if (displayQuizzes.length > 0 && currentIndex >= displayQuizzes.length) {
            setCurrentIndex(displayQuizzes.length - 1);
        }
    }, [displayQuizzes.length, currentIndex]);

    const handleSelectAnswer = (answerIndex: number) => {
        if (!showResult) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer !== null && currentQuiz) {
            // MOCK 퀴즈인 경우 로컬 상태만 업데이트
            if (currentQuiz.id.startsWith('mock-')) {
                const updatedQuizzes = displayQuizzes.map((quiz) => {
                    if (quiz.id === currentQuiz.id) {
                        return {
                            ...quiz,
                            userAnswer: selectedAnswer,
                            isCorrect: selectedAnswer === quiz.correctAnswer,
                        };
                    }
                    return quiz;
                });
                setDisplayQuizzes(updatedQuizzes);
            } else {
                // 실제 퀴즈는 부모 컴포넌트로 전달
                onAnswerQuiz(currentQuiz.id, selectedAnswer);
            }
            setShowResult(true);
        }
    };

    const handleNextQuiz = () => {
        // 마지막 문제이고 결과를 본 상태면 완료 화면으로
        if (isLastQuiz && showResult) {
            setCurrentIndex(displayQuizzes.length);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
        setSelectedAnswer(null);
        setShowResult(false);
    };

    const handleCheckSource = () => {
        if (currentQuiz) {
            window.open(currentQuiz.sourceUrl, '_blank');
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    if (displayQuizzes.length === 0) {
        return (
            <div className="quiz-view">
                <div className="quiz-header">
                    <div>
                        <h3>학습 퀴즈</h3>
                        <p className="quiz-subtitle">내가 저장해둔 출처를 기반으로 학습해보세요</p>
                    </div>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <p className="empty-title">퀴즈를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (currentIndex >= displayQuizzes.length) {
        return (
            <div className="quiz-view">
                <div className="quiz-header">
                    <div>
                        <h3>학습 퀴즈</h3>
                        <p className="quiz-subtitle">내가 저장해둔 출처를 기반으로 학습해보세요</p>
                    </div>
                </div>
                <div className="all-completed">
                    <div className="completed-icon">🎊</div>
                    <h4 className="completed-title">모든 퀴즈를 완료했습니다!</h4>
                    <div className="completed-stats">
                        <div className="stat-card">
                            <span className="stat-value">{displayQuizzes.length}</span>
                            <span className="stat-label">전체 문제</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value correct">{correctCount}</span>
                            <span className="stat-label">정답</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value incorrect">
                                {displayQuizzes.length - correctCount}
                            </span>
                            <span className="stat-label">오답</span>
                        </div>
                    </div>
                    <p className="completed-score">
                        최종 정답률: {Math.round((correctCount / displayQuizzes.length) * 100)}%
                    </p>
                    <div className="completed-actions">
                        <button className="restart-btn" onClick={handleRestart}>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            처음부터 다시 풀기
                        </button>
                    </div>
                    <div className="completed-list">
                        <h4 className="list-title">문제별 결과</h4>
                        <div className="completed-items">
                            {displayQuizzes.map((quiz, idx) => (
                                <div
                                    key={quiz.id}
                                    className={`completed-item ${
                                        quiz.isCorrect ? 'correct' : 'incorrect'
                                    }`}
                                >
                                    <span className="item-number">{idx + 1}</span>
                                    <span
                                        className={`item-badge ${
                                            quiz.isCorrect ? 'correct' : 'incorrect'
                                        }`}
                                    >
                                        {quiz.isCorrect ? '✓' : '✗'}
                                    </span>
                                    <span className="item-question">{quiz.question}</span>
                                    <button
                                        className="review-btn"
                                        onClick={() => {
                                            setCurrentIndex(idx);
                                            setSelectedAnswer(null);
                                            setShowResult(false);
                                        }}
                                        title="다시 보기"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        className="delete-item-btn"
                                        onClick={() => onDeleteQuiz(quiz.id)}
                                        title="삭제"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-view">
            <div className="quiz-header">
                <div>
                    <h3>학습 퀴즈</h3>
                    <p className="quiz-subtitle">내가 저장해둔 출처를 기반으로 학습해보세요</p>
                </div>
            </div>
            <div className="quiz-progress">
                <div className="progress-info">
                    <span className="progress-text">
                        진행률: {currentIndex + 1} / {displayQuizzes.length}
                    </span>
                    <span className="progress-score">
                        정답률:{' '}
                        {completedQuizzes.length > 0
                            ? `${Math.round((correctCount / completedQuizzes.length) * 100)}%`
                            : '0%'}
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentIndex + 1) / displayQuizzes.length) * 100}%` }}
                    />
                </div>
            </div>
            <div className="quiz-container">
                <div className="quiz-card-main">
                    <div className="quiz-badge">
                        <span className="badge-icon">💡</span>
                        <span className="badge-text">
                            문제 {currentIndex + 1} / {displayQuizzes.length}
                        </span>
                    </div>
                    <div className="related-question">
                        <span className="question-label">내가 했던 질문:</span>
                        <span className="question-content">{currentQuiz.relatedQuestion}</span>
                    </div>
                    <h4 className="quiz-question-main">{currentQuiz.question}</h4>
                    <div className="quiz-options">
                        {currentQuiz.options.map((option, idx) => (
                            <button
                                key={idx}
                                className={`quiz-option ${
                                    selectedAnswer === idx ? 'selected' : ''
                                }`}
                                onClick={() => handleSelectAnswer(idx)}
                                disabled={showResult}
                            >
                                <span className="option-number">{idx + 1}</span>
                                <span className="option-text">{option}</span>
                                {selectedAnswer === idx && !showResult && (
                                    <span className="selected-check">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                    {!showResult ? (
                        <button
                            className="submit-btn"
                            onClick={handleSubmitAnswer}
                            disabled={selectedAnswer === null}
                        >
                            정답 확인
                        </button>
                    ) : (
                        <div className="quiz-result">
                            {selectedAnswer === currentQuiz.correctAnswer ? (
                                <>
                                    <div className="result-header correct">
                                        <span className="result-icon">🎉</span>
                                        <span className="result-text">정답입니다!</span>
                                    </div>
                                    <div className="result-explanation">
                                        <p className="explanation-title">💡 해설</p>
                                        <p className="explanation-text">
                                            {currentQuiz.explanation}
                                        </p>
                                    </div>
                                    <div className="result-actions">
                                        <button
                                            className="source-btn secondary"
                                            onClick={handleCheckSource}
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                            출처 확인하기
                                        </button>
                                        <button className="next-btn" onClick={handleNextQuiz}>
                                            {isLastQuiz ? '최종 결과 보기' : '다음 문제'}
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="result-header incorrect">
                                        <span className="result-icon">😅</span>
                                        <span className="result-text">아쉽네요!</span>
                                    </div>
                                    <div className="correct-answer-info">
                                        <p className="correct-label">정답:</p>
                                        <p className="correct-option">
                                            {currentQuiz.correctAnswer + 1}.{' '}
                                            {currentQuiz.options[currentQuiz.correctAnswer]}
                                        </p>
                                    </div>
                                    <div className="result-explanation">
                                        <p className="explanation-title">💡 해설</p>
                                        <p className="explanation-text">
                                            {currentQuiz.explanation}
                                        </p>
                                    </div>
                                    <div className="source-recommendation">
                                        <p className="recommendation-text">
                                            더 자세한 내용은 내가 북마크한 출처를 확인해보세요!
                                        </p>
                                        <p className="source-title">{currentQuiz.sourceTitle}</p>
                                    </div>
                                    <div className="result-actions">
                                        <button
                                            className="source-btn primary"
                                            onClick={handleCheckSource}
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                            출처에서 복습하기
                                        </button>
                                        <button className="next-btn" onClick={handleNextQuiz}>
                                            {isLastQuiz ? '최종 결과 보기' : '다음 문제'}
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
