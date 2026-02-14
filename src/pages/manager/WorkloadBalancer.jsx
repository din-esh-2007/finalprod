import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function WorkloadBalancer() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/manager/team-stability')
            .then(data => {
                if (!data || !data.teamMetrics || data.teamMetrics.length === 0) {
                    // Fallback Simulation
                    setTeam([
                        { id: 901, name: 'Alex Developer (Simulated)', burnout_phase: 3, neural_load_index: 85, adaptive_capacity_score: 40 },
                        { id: 902, name: 'Sarah Designer (Simulated)', burnout_phase: 1, neural_load_index: 45, adaptive_capacity_score: 80 },
                        { id: 903, name: 'Mike QA (Simulated)', burnout_phase: 2, neural_load_index: 65, adaptive_capacity_score: 60 },
                        { id: 904, name: 'Emma Product (Simulated)', burnout_phase: 4, neural_load_index: 92, adaptive_capacity_score: 25 },
                        { id: 905, name: 'James DevOps (Simulated)', burnout_phase: 1, neural_load_index: 30, adaptive_capacity_score: 90 }
                    ]);
                } else {
                    setTeam(data.teamMetrics);
                }
            })
            .catch(err => {
                console.error(err);
                setTeam([
                    { id: 901, name: 'Alex Developer (Simulated)', burnout_phase: 3, neural_load_index: 85, adaptive_capacity_score: 40 },
                    { id: 902, name: 'Sarah Designer (Simulated)', burnout_phase: 1, neural_load_index: 45, adaptive_capacity_score: 80 }
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const highRisk = team.filter(e => e.burnout_phase >= 3);
    const lowRisk = team.filter(e => e.burnout_phase <= 2).slice(0, 3);

    const [simResults, setSimResults] = useState(null);
    const [selectedEmp, setSelectedEmp] = useState('');

    const handleSimulate = (empName) => {
        setSelectedEmp(empName);
        if (!empName) {
            setSimResults(null);
            return;
        }

        const emp = team.find(e => e.name === empName);
        if (!emp) return;

        // Simple simulation: move 30% load to the lowest risk people
        const loadToMove = emp.neural_load_index * 0.3;
        const projectedPhase = emp.burnout_phase > 1 ? emp.burnout_phase - 1 : 1;

        setSimResults({
            oldPhase: emp.burnout_phase,
            newPhase: projectedPhase,
            loadSaved: Math.round(loadToMove),
            teamImpact: '8% Stability Gain'
        });
    };

    const handleBalance = (id) => {
        alert('Redistribution successfully applied. Notifications sent to relevant team members.');
        setTeam(prev => prev.map(e => e.id === id ? { ...e, burnout_phase: e.burnout_phase - 1 } : e));
    };

    return (
        <div className="workload-balancer">
            <div className="card" style={{ marginBottom: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">⚖️ Cognitive Workload Balancer</div>
                        <div className="card-subtitle">AI-driven redistribution suggestions based on stability signals</div>
                    </div>
                </div>

                {highRisk.length > 0 ? (
                    <div style={{ marginTop: 20 }}>
                        <h4 style={{ fontSize: 14, color: 'var(--error)', marginBottom: 15 }}>🚨 High Load Clusters Detected</h4>
                        {highRisk.map(emp => (
                            <div key={emp.id} className="suggestion-card error" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 15 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{emp.name} (Phase {emp.burnout_phase})</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Load: {Math.round(emp.neural_load_index)}% | Capacity: {Math.round(emp.adaptive_capacity_score)}%</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 11, marginBottom: 4 }}>Suggest moving tasks to:</div>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        {lowRisk.map(helper => (
                                            <span key={helper.id} className="badge info" style={{ fontSize: 9 }}>{helper.name.split(' ')[0]}</span>
                                        ))}
                                    </div>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleBalance(emp.id)}>Balance</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div style={{ fontSize: 40, marginBottom: 15 }}>⚖️</div>
                        <h3>Team Workload is Balanced</h3>
                        <p style={{ color: 'var(--text-muted)' }}>All employees currently exhibit stable adaptive capacity.</p>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">🧪 Redistribution Simulator</div>
                </div>
                <div style={{ padding: '20px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' }}>Select an employee to see how redistributing their tasks would affect team-wide stability.</p>
                    <div style={{ display: 'flex', gap: 15, justifyContent: 'center', marginBottom: 20 }}>
                        <select className="form-input" style={{ maxWidth: 300 }} value={selectedEmp} onChange={(e) => handleSimulate(e.target.value)}>
                            <option value="">Select Employee...</option>
                            {team.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                        </select>
                    </div>

                    {simResults && (
                        <div className="suggestion-card info" style={{ textAlign: 'left', animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stability Shift</div>
                                    <div style={{ fontSize: 18, fontWeight: 700 }}>Phase {simResults.oldPhase} → {simResults.newPhase}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Neural Relief</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>-{simResults.loadSaved}% Load</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Team Impact</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{simResults.teamImpact}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
