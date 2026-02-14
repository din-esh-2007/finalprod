import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(username, password);
            const role = data.user.role.toLowerCase();
            navigate(`/${role}`);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon">🛡️</div>
                    <h1>Burnout & Focus Guardian</h1>
                    <p>Enterprise Workforce Management System</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            id="login-username"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            id="login-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        id="login-submit"
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: 18, height: 18, margin: 0, borderWidth: 2 }}></div>
                                Signing in...
                            </>
                        ) : (
                            <>🔐 Sign In</>
                        )}
                    </button>
                </form>

                <div className="login-credentials">
                    <h4>Demo Credentials</h4>
                    <p>
                        <strong>Admin:</strong> admin / admin123<br />
                        <strong>Manager:</strong> manager1 / password123<br />
                        <strong>Employee:</strong> employee1 / password123
                    </p>
                </div>
            </div>
        </div>
    );
}
