import { useState, useEffect } from 'react';
import './DocumentView.css';
import type { Document } from '../../types';

const MOCK_DOCUMENTS: Document[] = [
    {
        id: 'doc-1',
        title: 'React Hook의 이해와 활용',
        content: `## React Hook이란?

            React Hook은 함수형 컴포넌트에서 상태 관리와 생명주기 기능을 사용할 수 있게 해주는 기능입니다.

            ### 주요 Hook 종류

            **useState**
            - 컴포넌트의 상태를 관리하는 가장 기본적인 Hook
            - const [state, setState] = useState(initialValue) 형태로 사용
            - 상태가 변경되면 컴포넌트가 리렌더링됨

            **useEffect**
            - 부수 효과(side effect)를 처리하는 Hook
            - 데이터 fetching, 구독 설정, DOM 조작 등에 사용
            - 의존성 배열을 통해 실행 시점을 제어

            **useContext**
            - Context API와 함께 사용하여 전역 상태를 관리
            - props drilling 문제를 해결

            ### 사용 시 주의사항

            1. Hook은 최상위 레벨에서만 호출해야 함
            2. React 함수 컴포넌트 내에서만 호출해야 함
            3. 조건문이나 반복문 안에서 호출하면 안 됨
        `,
        sourceTitle: 'React 공식 문서 - Hooks 소개',
        sourceUrl: 'https://react.dev/reference/react',
        relatedQuestion: 'React Hook에 대해 알려주세요',
    },
];

export default function DocumentView() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: API 호출로 변경
        setTimeout(() => {
            setDocuments(MOCK_DOCUMENTS);
            setLoading(false);
        }, 500);
    }, []);

    const handleOpenSource = (url: string) => {
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="document-view">
                <div className="document-header">
                    <h3>학습 도큐먼트</h3>
                    <p className="document-subtitle">북마크 기반으로 정리된 학습 자료</p>
                </div>
                <div className="loading-state">
                    <div className="typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <p>도큐먼트를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="document-view">
                <div className="document-header">
                    <h3>학습 도큐먼트</h3>
                    <p className="document-subtitle">북마크 기반으로 정리된 학습 자료</p>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">📄</div>
                    <p className="empty-title">아직 도큐먼트가 없습니다</p>
                    <p className="empty-subtitle">
                        북마크를 저장하면 자동으로 학습 자료가 생성됩니다
                    </p>
                </div>
            </div>
        );
    }

    // 상세 보기
    if (selectedDoc) {
        return (
            <div className="document-view">
                <div className="document-header">
                    <button className="back-btn" onClick={() => setSelectedDoc(null)}>
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        목록으로
                    </button>
                </div>
                <div className="document-detail">
                    <div className="document-detail-header">
                        <h2 className="document-detail-title">{selectedDoc.title}</h2>
                        <div className="document-meta">
                            <span className="document-question">
                                질문: "{selectedDoc.relatedQuestion}"
                            </span>
                        </div>
                    </div>

                    <div className="document-content">
                        <pre>{selectedDoc.content}</pre>
                    </div>

                    <div className="document-sources">
                        <h4 className="sources-title">📚 참고 출처</h4>
                        <div
                            className="source-card"
                            onClick={() => handleOpenSource(selectedDoc.sourceUrl)}
                        >
                            <div className="source-info">
                                <span className="source-title">{selectedDoc.sourceTitle}</span>
                                <span className="source-url">{selectedDoc.sourceUrl}</span>
                            </div>
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 목록 보기
    return (
        <div className="document-view">
            <div className="document-header">
                <div>
                    <h3>학습 도큐먼트</h3>
                    <p className="document-subtitle">북마크 기반으로 정리된 학습 자료</p>
                </div>
                <span className="document-count">{documents.length}개</span>
            </div>

            <div className="document-list">
                {documents.map((doc) => (
                    <div key={doc.id} className="document-card" onClick={() => setSelectedDoc(doc)}>
                        <div className="document-card-header">
                            <h4 className="document-card-title">{doc.title}</h4>
                        </div>
                        <p className="document-card-question">"{doc.relatedQuestion}"</p>
                        <div className="document-card-footer">
                            <span className="document-card-sources">📚 {doc.sourceTitle}</span>
                            <span className="document-card-arrow">→</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
