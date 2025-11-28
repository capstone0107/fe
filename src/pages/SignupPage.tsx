import { useState } from 'react';
import { authAPI } from '../api/auth';
import './SignupPage.css';

interface SignupPageProps {
    onBack: () => void;
}

function SignupPage({ onBack }: SignupPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);

        try {
            await authAPI.signup(email, password, name);
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            onBack();
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || '회원가입에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-header">
                    <img src="/logo.png" alt="레빗홀 로고" className="logo" />
                    <p>레빗홀: 대화에서 시작되는 출처 기반의 학습</p>
                </div>

                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">이름</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="홍길동"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                            disabled={loading}
                            minLength={8}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">비밀번호 확인</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호를 다시 입력하세요"
                            required
                            disabled={loading}
                            minLength={8}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="signup-button" disabled={loading}>
                        {loading ? '가입 중...' : '회원가입'}
                    </button>

                    <button
                        type="button"
                        className="back-button"
                        onClick={onBack}
                        disabled={loading}
                    >
                        로그인으로 돌아가기
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;
