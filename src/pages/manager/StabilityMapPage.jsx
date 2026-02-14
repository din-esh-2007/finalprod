import TeamStability from '../../components/TeamStability';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function StabilityMapPage() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/manager/team-stability')
            .then(data => setTeam(data.teamMetrics))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getPhaseColor = (p) => {
        if (p === 4) return 'var(--error)';
        if (p === 3) return 'var(--warning)';
        if (p === 2) return 'var(--accent)';
        return 'var(--success)';
    };

    return (
        <div>
            <TeamStability />

            <div className="card" style={{ marginTop: 25 }}>
                <div className="card-header">
                    <div className="card-title">👥 Individual Stability Index</div>
                </div>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Current Phase</th>
                                <th>Neural Load</th>
                                <th>Capacity</th>
                                <th>Stability Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.map(emp => (
                                <tr key={emp.id}>
                                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                                    <td>
                                        <span className="badge" style={{ background: `${getPhaseColor(emp.burnout_phase)}22`, color: getPhaseColor(emp.burnout_phase), border: `1px solid ${getPhaseColor(emp.burnout_phase)}44` }}>
                                            Phase {emp.burnout_phase}
                                        </span>
                                    </td>
                                    <td>{Math.round(emp.neural_load_index)}%</td>
                                    <td>{Math.round(emp.adaptive_capacity_score)}%</td>
                                    <td style={{ color: getPhaseColor(emp.burnout_phase) }}>
                                        {emp.burnout_phase >= 3 ? '⚠️ Unstable' : '✅ Stable'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
