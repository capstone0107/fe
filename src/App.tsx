import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setIsLoggedIn(!!token);
        setLoading(false);
    }, []);

    if (loading) {
        return null;
    }

    if (isLoggedIn) {
        return <MainPage />;
    }

    if (showSignup) {
        return <SignupPage onBack={() => setShowSignup(false)} />;
    }

    return <LoginPage onSignupClick={() => setShowSignup(true)} />;
}

export default App;
