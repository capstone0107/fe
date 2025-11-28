import { useState } from 'react';
import { authAPI } from '../api/auth';
import './LoginPage.css';

interface LoginPageProps {
    onSignupClick: () => void;
}

function LoginPage({ onSignupClick }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authAPI.login(email, password);
            localStorage.setItem('authToken', data.access_token);
            window.location.reload();
        } catch (err: any) {
            setError(err.message || '로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <img src="./logo.png" alt="레빗홀 로고" className="logo" />
                    <p>레빗홀: 대화에서 시작되는 출처 기반의 학습</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
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
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="login-footer">
                    <span>계정이 없으신가요?</span>
                    <button type="button" className="link-button" onClick={onSignupClick}>
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
