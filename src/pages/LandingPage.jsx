import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const handleStart = () => {
        if (isAuthenticated) {
            navigate(`/${user.role.toLowerCase()}`);
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="landing-container">
                    <div className="logo-group">
                        <span className="logo-icon">🛡️</span>
                        <span className="logo-text">NeuralGuardian AI</span>
                    </div>
                    <nav className="landing-nav">
                        <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
                        <button className="btn btn-primary btn-sm" onClick={handleStart}>Get Started</button>
                    </nav>
                </div>
            </header>

            <main className="landing-main">
                <section className="hero-section">
                    <div className="landing-container">
                        <div className="hero-content">
                            <div className="badge info reveal">Hackathon Finalist 2026</div>
                            <h1 className="reveal">The Future of <span>Workforce Sustainability</span></h1>
                            <p className="reveal" style={{ animationDelay: '0.1s' }}>
                                Predict burnout before it happens. Use advanced neural telemetry and behavioral AI
                                to protect your team's most valuable asset: their cognitive health.
                            </p>
                            <div className="hero-actions reveal" style={{ animationDelay: '0.2s' }}>
                                <button className="btn btn-primary btn-lg" onClick={handleStart}>
                                    🛡️ Deploy Neural Shield
                                </button>
                                <button className="btn btn-ghost btn-lg">
                                    Watch Deep Dive
                                </button>
                            </div>
                        </div>
                        <div className="hero-visual reveal" style={{ animationDelay: '0.3s' }}>
                            <div className="visual-card">
                                <div className="visual-header">
                                    <div className="dot red"></div>
                                    <div className="dot yellow"></div>
                                    <div className="dot green"></div>
                                </div>
                                <div className="visual-content">
                                    <div className="chart-placeholder">
                                        <div className="bar" style={{ height: '40%' }}></div>
                                        <div className="bar" style={{ height: '70%' }}></div>
                                        <div className="bar" style={{ height: '90%' }}></div>
                                        <div className="bar" style={{ height: '50%' }}></div>
                                        <div className="bar" style={{ height: '85%' }}></div>
                                    </div>
                                    <div className="stability-meter">
                                        <span>Org Stability:</span>
                                        <strong className="text-success">84.2%</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="features-grid-section">
                    <div className="landing-container">
                        <div className="section-header text-center">
                            <h2>Equipping Teams for the Age of AI</h2>
                            <p>Three specialized portals designed for maximum organizational health.</p>
                        </div>
                        <div className="grid-3" style={{ marginTop: 50 }}>
                            <div className="feature-card reveal" style={{ animationDelay: '0.1s' }}>
                                <div className="icon purple">👥</div>
                                <h3>Employee Shield</h3>
                                <p>Personal risk radar, recovery planner, and focus forecasting to prevent cognitive exhaustion.</p>
                            </div>
                            <div className="feature-card reveal" style={{ animationDelay: '0.2s' }}>
                                <div className="icon cyan">👔</div>
                                <h3>Manager Console</h3>
                                <p>Real-time team stability maps, retention predictors, and automated workload balancing.</p>
                            </div>
                            <div className="feature-card reveal" style={{ animationDelay: '0.3s' }}>
                                <div className="icon green">🏢</div>
                                <h3>Admin Intel</h3>
                                <p>Organizational intelligence, economic impact analytics, and strategic workforce planning.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-container">
                    <p>&copy; 2026 NeuralGuardian AI. Protecting the human element in high-performance environments.</p>
                </div>
            </footer>
        </div>
    );
}
