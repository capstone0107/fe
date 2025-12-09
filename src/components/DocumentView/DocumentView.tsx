import { useState, useEffect } from 'react';
import './DocumentView.css';
import type { Document } from '../../types';
import { documentAPI } from '../../api/document';
import ReactMarkdown from 'react-markdown';

export default function DocumentView() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await documentAPI.getAllDocuments();
                const fetchedDocs: Document[] = response.documents.map((doc: any) => ({
                    id: String(doc.id),
                    title: doc.title,
                    content: doc.content,
                    sourceTitle: doc.source_title,
                    sourceUrl: doc.source_url,
                    relatedQuestion: doc.related_question,
                }));
                setDocuments(fetchedDocs);
            } catch (err) {
                console.error('도큐먼트 로딩 실패:', err);
                setError('도큐먼트를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
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

    if (error) {
        return (
            <div className="document-view">
                <div className="document-header">
                    <h3>학습 도큐먼트</h3>
                    <p className="document-subtitle">북마크 기반으로 정리된 학습 자료</p>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">❌</div>
                    <p className="empty-title">{error}</p>
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
                        <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
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
