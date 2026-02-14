import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { generatePDFReport } from '../../utils/reportGenerator';

export default function ConsolidatedAIReport() {
    const [activeTab, setActiveTab] = useState('strategic');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
    }, []);

    const mockData = [
        { name: 'Jan', value: 45, load: 30, stability: 88 },
        { name: 'Feb', value: 52, load: 45, stability: 82 },
        { name: 'Mar', value: 48, load: 40, stability: 85 },
        { name: 'Apr', value: 61, load: 55, stability: 78 },
        { name: 'May', value: 55, load: 50, stability: 80 },
        { name: 'Jun', value: 67, load: 60, stability: 75 },
    ];

    const pieData = [
        { name: 'Americas', value: 400, fill: '#06b6d4' },
        { name: 'Europe', value: 300, fill: '#6366f1' },
        { name: 'APAC', value: 300, fill: '#10b981' },
        { name: 'Middle East', value: 200, fill: '#f59e0b' },
    ];

    const handleDownload = async () => {
        setGenerating(true);
        try {
            await generatePDFReport('consolidated-ai-report', { role: 'Admin', title: 'Strategic Intelligence Summary' });
        } catch (e) {
            alert('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div><p>Calculating neural insights...</p></div>;

    return (
        <div className="consolidated-report-page">
            {/* Tabs Navigation */}
            <div className="tabs" style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '15px', border: '1px solid var(--border)', marginBottom: 25 }}>
                <button className={`tab ${activeTab === 'strategic' ? 'active' : ''}`} onClick={() => setActiveTab('strategic')}>🎯 Strategic AI</button>
                <button className={`tab ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>🌍 Global Map</button>
                <button className={`tab ${activeTab === 'exec' ? 'active' : ''}`} onClick={() => setActiveTab('exec')}>📑 Executive Summary</button>
                <button className={`tab ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>📜 Detailed Report & Download</button>
            </div>

            <div id="consolidated-ai-report">
                {activeTab === 'strategic' && (
                    <div className="card reveal">
                        <div className="card-header">
                            <div>
                                <div className="card-title">🎯 Strategic Growth & Health Modeling</div>
                                <div className="card-subtitle">AI-driven projections for organizational expansion vs neural capacity</div>
                            </div>
                        </div>
                        <div style={{ height: 400, marginTop: 25 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                    <YAxis axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                                    <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="card-footer" style={{ marginTop: 20, padding: 15, background: 'rgba(6, 182, 212, 0.05)', borderRadius: 10 }}>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                <strong>Guardian AI Suggestion:</strong> Organizational velocity is currently outpacing stability by 12%. Recommend a 15% reduction in meeting density for Q3 to prevent a Phase 3 collapse.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'global' && (
                    <div className="card reveal">
                        <div className="card-header">
                            <div>
                                <div className="card-title">🌍 Global Stability Distribution</div>
                                <div className="card-subtitle">Regional cognitive health clusters and performance metrics</div>
                            </div>
                        </div>
                        <div className="grid-2" style={{ marginTop: 25, alignItems: 'center' }}>
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                {pieData.map(p => (
                                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15, padding: 15, background: 'var(--bg-glass)', borderRadius: 10 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.fill }}></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Regional Stability Index: 84.5</div>
                                        </div>
                                        <div style={{ color: 'var(--success)', fontWeight: 700 }}>+{Math.floor(Math.random() * 5)}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exec' && (
                    <div className="card reveal">
                        <div className="card-header">
                            <div>
                                <div className="card-title">📑 AI Executive Oversight Summary</div>
                                <div className="card-subtitle">Consolidated high-level metrics for board-level reporting</div>
                            </div>
                        </div>
                        <div style={{ height: 400, marginTop: 25 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                    <YAxis axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                                    <Bar dataKey="stability" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Stability Index" />
                                    <Bar dataKey="load" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Workload Stress" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
                            <div className="stat-card mini">
                                <div className="stat-label">Exec Stability</div>
                                <div className="stat-value" style={{ fontSize: 20 }}>89.2%</div>
                            </div>
                            <div className="stat-card mini">
                                <div className="stat-label">Org Resilience</div>
                                <div className="stat-value" style={{ fontSize: 20 }}>Strong</div>
                            </div>
                            <div className="stat-card mini">
                                <div className="stat-label">Attrition Prediction</div>
                                <div className="stat-value" style={{ fontSize: 20 }}>-4.2%</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'report' && (
                    <div className="card reveal">
                        <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <div>
                                    <div className="card-title">📜 Integrated Strategic Report</div>
                                    <div className="card-subtitle">Detailed qualitative and quantitative AI analysis</div>
                                </div>
                                <button className="btn btn-primary" onClick={handleDownload} disabled={generating}>
                                    {generating ? '⌛ Generating...' : '📥 Download PDF Report'}
                                </button>
                            </div>
                        </div>

                        <div className="report-content-detailed" style={{ marginTop: 30, lineHeight: 1.8 }}>
                            <section style={{ marginBottom: 40 }}>
                                <h3 style={{ color: 'var(--primary)', marginBottom: 15 }}>1. Strategic Outlook Analysis</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Based on the <strong>Growth vs stability modeling</strong>, the organization is currently in a "Hyper-Velocity" phase.
                                    While performance is at peak levels, the underlying neural telemetry indicates a rising "Stability Debt."
                                    If left unmanaged, the predictive model forecasts a 22% increase in turnover risk within the next 90 days.
                                    We recommend implementing the <em>"Quiet-Friday"</em> protocol to stabilize neural flux.
                                </p>
                            </section>

                            <section style={{ marginBottom: 40 }}>
                                <h3 style={{ color: 'var(--accent)', marginBottom: 15 }}>2. Global Health & Regional Disparity</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    The <strong>Global Stability Distribution</strong> reveals that the APAC and Americas regions are performing optimally.
                                    However, the Europe region shows significant variance in the "Recovery Velocity" metric.
                                    This correlate with the recent increase in project density in that territory.
                                    Cross-regional workload balancing is advised to capitalize on surplus capacity in APAC.
                                </p>
                            </section>

                            <section style={{ marginBottom: 40 }}>
                                <h3 style={{ color: 'var(--success)', marginBottom: 15 }}>3. Executive Risk Assessment</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    The <strong>Executive Oversight Summary</strong> indicates that overall organizational resilience remains "Strong."
                                    The "Stability Index" (currently at 89.2%) is well above the industry benchmark.
                                    Our attrition prediction has dropped by 4.2% following the implementation of the AI-driven wellness alerts.
                                    Continuous monitoring of the "Workload Stress" metric is critical as we enter the next fiscal period.
                                </p>
                            </section>

                            <footer style={{ marginTop: 50, borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                                Certified by Guardian AI Neural Engine v4.2 | Internal Use Only
                            </footer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
