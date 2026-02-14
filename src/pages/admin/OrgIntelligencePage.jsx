import OrgIntelligence from '../../components/OrgIntelligence';

export default function OrgIntelligencePage() {
    return (
        <div className="admin-org-intel">
            <div className="card" style={{ marginBottom: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">🏢 Global Organizational Intelligence</div>
                        <div className="card-subtitle">C-level strategic stability overview across all departments</div>
                    </div>
                </div>
            </div>

            <OrgIntelligence />

            <div className="card" style={{ marginTop: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">📡 Remote Workforce Heatmap</div>
                        <div className="card-subtitle">Algorithmic stability mapping across global office hubs</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 20 }}>
                    {[
                        { region: 'North America', stability: '88%', noise: 'Low', color: 'var(--success)' },
                        { region: 'EMEA (High Stress)', stability: '64%', noise: 'Critical', color: 'var(--error)' },
                        { region: 'Asia Pacific', stability: '92%', noise: 'Minimal', color: 'var(--success)' },
                        { region: 'Remote-LatAm', stability: '76%', noise: 'Medium', color: 'var(--warning)' }
                    ].map(region => (
                        <div key={region.region} style={{ padding: 20, background: 'var(--bg-glass)', borderRadius: 12, border: `1px solid ${region.color}22`, borderLeft: `4px solid ${region.color}` }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Region</div>
                            <div style={{ fontSize: 18, fontWeight: 700, margin: '5px 0' }}>{region.region}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Flow Stability:</span>
                                <span style={{ fontWeight: 800, color: region.color }}>{region.stability}</span>
                            </div>
                            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 10 }}>
                                <div style={{ height: '100%', width: region.stability, background: region.color, borderRadius: 2 }}></div>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 15 }}>
                                Neural Noise Level: <strong style={{ color: region.color }}>{region.noise}</strong>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 20, padding: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>ℹ️</span>
                    The heatmap uses <strong>Neural Load Aggregation</strong> to detect regions where "Meeting Overload" is significantly impacting async productivity.
                </div>
            </div>
        </div>
    );
}
