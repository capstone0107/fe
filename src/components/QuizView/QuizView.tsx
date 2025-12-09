import { useState, useEffect } from 'react';
import './QuizView.css';
import type { Quiz } from '../../types';
import { quizAPI } from '../../api/quiz';

export default function QuizView() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [displayQuizzes, setDisplayQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // API에서 퀴즈 목록 가져오기
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await quizAPI.getAllQuizzes();
                const fetchedQuizzes: Quiz[] = response.quizzes.map((quiz: any) => ({
                    id: String(quiz.id),
                    question: quiz.question,
                    options: quiz.options,
                    correctAnswer: quiz.correct_answer,
                    explanation: quiz.explanation || '',
                    relatedQuestion: quiz.related_question,
                    sourceUrl: quiz.source_url,
                    sourceTitle: quiz.source_title,
                    userAnswer: undefined,
                    isCorrect: undefined,
                }));
                setDisplayQuizzes(fetchedQuizzes);
            } catch (err) {
                console.error('퀴즈 로딩 실패:', err);
                setError('퀴즈를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const currentQuiz = displayQuizzes[currentIndex];
    const completedQuizzes = displayQuizzes.filter((q) => q.userAnswer !== undefined);
    const correctCount = completedQuizzes.filter((q) => q.isCorrect).length;
    const isLastQuiz = currentIndex === displayQuizzes.length - 1;

    const handleSelectAnswer = (answerIndex: number) => {
        if (!showResult) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer !== null && currentQuiz) {
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
            setShowResult(true);
        }
    };

    const handleNextQuiz = () => {
        if (isLastQuiz && showResult) {
            setCurrentIndex(displayQuizzes.length);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
        setSelectedAnswer(null);
        setShowResult(false);
    };

    const handleCheckSource = () => {
        if (currentQuiz?.sourceUrl) {
            window.open(currentQuiz.sourceUrl, '_blank');
        }
    };

    const handleRestart = () => {
        const resetQuizzes = displayQuizzes.map((quiz) => ({
            ...quiz,
            userAnswer: undefined,
            isCorrect: undefined,
        }));
        setDisplayQuizzes(resetQuizzes);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    const handleDeleteQuiz = async (quizId: string) => {
        try {
            await quizAPI.deleteQuiz(quizId);
            setDisplayQuizzes(displayQuizzes.filter((q) => q.id !== quizId));
        } catch (err) {
            console.error('퀴즈 삭제 실패:', err);
        }
    };

    // 로딩 상태
    if (loading) {
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

    // 에러 상태
    if (error) {
        return (
            <div className="quiz-view">
                <div className="quiz-header">
                    <div>
                        <h3>학습 퀴즈</h3>
                        <p className="quiz-subtitle">내가 저장해둔 출처를 기반으로 학습해보세요</p>
                    </div>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">❌</div>
                    <p className="empty-title">{error}</p>
                </div>
            </div>
        );
    }

    // 퀴즈가 없는 상태
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
                    <div className="empty-icon">📭</div>
                    <p className="empty-title">아직 퀴즈가 없습니다</p>
                    <p className="empty-subtitle">대화를 통해 퀴즈를 생성해보세요!</p>
                </div>
            </div>
        );
    }

    // 완료 화면
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
                                        onClick={() => handleDeleteQuiz(quiz.id)}
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
                                        {currentQuiz.sourceUrl && (
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
                                        )}
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
                                    {currentQuiz.sourceTitle && (
                                        <div className="source-recommendation">
                                            <p className="recommendation-text">
                                                더 자세한 내용은 내가 북마크한 출처를 확인해보세요!
                                            </p>
                                            <p className="source-title">
                                                {currentQuiz.sourceTitle}
                                            </p>
                                        </div>
                                    )}
                                    <div className="result-actions">
                                        {currentQuiz.sourceUrl && (
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
                                        )}
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
