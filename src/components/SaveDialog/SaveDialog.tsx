import './SaveDialog.css';

interface SaveDialogProps {
    isOpen: boolean;
    title: string;
    onTitleChange: (title: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function SaveDialog({
    isOpen,
    title,
    onTitleChange,
    onSave,
    onCancel,
}: SaveDialogProps) {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSave();
        }
    };

    return (
        <div className="dialog-overlay" onClick={onCancel}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <h3>대화 저장</h3>
                <p className="dialog-desc">이 대화 내용을 검증된 대화로 저장합니다.</p>
                <input
                    type="text"
                    className="dialog-input"
                    placeholder="대화 제목을 입력하세요"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <div className="dialog-actions">
                    <button className="dialog-btn cancel" onClick={onCancel}>
                        취소
                    </button>
                    <button
                        className="dialog-btn confirm"
                        onClick={onSave}
                        disabled={!title.trim()}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
