import { useState, useRef } from 'react';
import { generatePDFReport } from '../../utils/reportGenerator';
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock report data for generation
const reportData = {
    stabilityTrend: [
        { day: 'Mon', value: 82 }, { day: 'Tue', value: 85 }, { day: 'Wed', value: 78 },
        { day: 'Thu', value: 92 }, { day: 'Fri', value: 94 }, { day: 'Sat', value: 90 }, { day: 'Sun', value: 92 }
    ],
    metrics: [
        { name: 'Cognitive Resilience', score: '92%', status: 'Optimal' },
        { name: 'Neural Recovery Rate', score: '88%', status: 'High' },
        { name: 'Stress Latency', score: '12ms', status: 'Low' },
        { name: 'Focus Depth', score: '4.2h', status: 'Peak' }
    ]
};

export default function WellnessReports() {
    const [generating, setGenerating] = useState(false);
    const reportRef = useRef(null);

    const handleDownload = async (name) => {
        setGenerating(true);
        // Small delay to ensure render
        setTimeout(async () => {
            try {
                await generatePDFReport('printable-report', { role: 'Employee', title: name });
            } catch (e) {
                console.error(e);
            } finally {
                setGenerating(false);
            }
        }, 500);
    };

    return (
        <div className="wellness-reports-page">
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">📜 Wellness & Cognitive Reports</div>
                        <div className="card-subtitle">Exportable PDF certifications of your stability health</div>
                    </div>
                </div>
                <div className="data-table-container" style={{ marginTop: 20 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Report Name</th>
                                <th>Period</th>
                                <th>Stability Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Feb Week 2 - Resilience Audit', period: 'Feb 7 - Feb 14', score: 'High (92%)', color: 'var(--success)' },
                                { name: 'Jan Monthly Stability Summary', period: 'Jan 1 - Jan 31', score: 'Moderate (74%)', color: 'var(--warning)' },
                                { name: 'Task Switching Audit - Q1', period: 'Jan 1 - Feb 14', score: 'Critical (42%)', color: 'var(--error)' }
                            ].map((rpt, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 600 }}>{rpt.name}</td>
                                    <td>{rpt.period}</td>
                                    <td style={{ color: rpt.color }}>{rpt.score}</td>
                                    <td>
                                        <button
                                            className="btn btn-xs btn-primary"
                                            onClick={() => handleDownload(rpt.name)}
                                            disabled={generating}
                                        >
                                            {generating ? '...' : 'Download PDF'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="empty-state" style={{ padding: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 15 }}>📊</div>
                    <h3>Personalized Benchmarking</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '10px auto' }}>
                        Compare your cognitive resilience against departmental anonymous averages to understand your relative performance health.
                    </p>
                    <button className="btn btn-ghost" style={{ marginTop: 15 }}>Generate New Report</button>
                </div>
            </div>

            {/* HIDDEN REPORT TEMPLATE FOR PDF GENERATION */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div id="printable-report" style={{
                    width: '800px',
                    padding: '40px',
                    background: '#0f0f23',
                    color: '#f1f5f9',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #6366f1', paddingBottom: '20px', marginBottom: '30px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', color: '#6366f1' }}>NEURAL GUARDIAN</h1>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Wellness & Cognitive Stability Report</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 700 }}>Employee: Demo User</p>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>ID: EMP-8829 | Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#818cf8' }}>Stability Performance Index</h2>
                    <div style={{ height: '300px', width: '100%', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reportData.stabilityTrend}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="day" stroke="#94a3b8" />
                                <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid #6366f1' }} />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#818cf8' }}>Cognitive Metrics Audit</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #252550' }}>
                                <th style={{ padding: '12px', color: '#94a3b8' }}>Metric Name</th>
                                <th style={{ padding: '12px', color: '#94a3b8' }}>Variance Score</th>
                                <th style={{ padding: '12px', color: '#94a3b8' }}>Audit Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.metrics.map((m, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #252550' }}>
                                    <td style={{ padding: '12px', fontWeight: 600 }}>{m.name}</td>
                                    <td style={{ padding: '12px' }}>{m.score}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            background: m.status === 'Optimal' || m.status === 'High' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                                            color: m.status === 'Optimal' || m.status === 'High' ? '#10b981' : '#818cf8'
                                        }}>{m.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ background: 'rgba(99,102,241,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <h4 style={{ color: '#6366f1', marginBottom: '10px' }}>Guardian AI Summary</h4>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#94a3b8' }}>
                            Current analysis shows strong neural resilience with minor dips during peak switching hours.
                            The system recommends maintaining current recovery protocols.
                            Overall stability rating is highly compatible with current workforce load.
                        </p>
                    </div>

                    <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
                        This is an AI-generated biometric certificate powered by Neural Guardian Platform.
                    </div>
                </div>
            </div>
        </div>
    );
}
