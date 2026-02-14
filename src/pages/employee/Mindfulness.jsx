import { useState, useEffect } from 'react';

const exercises = [
    { id: 1, title: 'Box Breathing', duration: '5 min', icon: '🫁', desc: 'Regulate your nervous system with equal 4-second counts.', steps: ['Inhale', 'Hold', 'Exhale', 'Hold'], cycle: 4 },
    { id: 2, title: 'Neural Reset', duration: '10 min', icon: '🧠', desc: 'Visual stimulation to reset focus patterns after heavy KPM.', steps: ['Focus on the bar', 'Follow the movement', 'Blink every 10s', 'Relax jaw'], cycle: 8 },
    { id: 3, title: 'Non-Sleep Deep Rest', duration: '15 min', icon: '🧘', desc: 'Deep recovery for accumulated latent stress.', steps: ['Scan Body', 'Release Tension', 'Notice Breath', 'Deep Silence'], cycle: 12 },
    { id: 4, title: 'Digital Silence', duration: '2 min', icon: '🔇', desc: 'Mini break to clear cognitive fragmentation.', steps: ['Eyes Closed', 'Ears Open', 'No Interaction', 'Complete Stillness'], cycle: 30 }
];

export default function Mindfulness() {
    const [active, setActive] = useState(null);
    const [step, setStep] = useState(0);
    const [timer, setTimer] = useState(0);

    const activeEx = exercises.find(e => e.id === active);

    useEffect(() => {
        let interval;
        if (active) {
            setStep(0);
            setTimer(0);
            interval = setInterval(() => {
                setTimer(prev => {
                    const next = prev + 1;
                    if (next >= activeEx.cycle) {
                        setStep(s => (s + 1) % activeEx.steps.length);
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [active, activeEx?.cycle, activeEx?.steps?.length]);

    const getSimulation = () => {
        if (active === 1) { // Box Breathing
            return (
                <div className="sim-box-breathing">
                    <div className={`breathing-circle ${activeEx.steps[step].toLowerCase()}`}>
                        <div className="inner-circle"></div>
                    </div>
                </div>
            );
        }
        if (active === 2) { // Neural Reset
            return (
                <div className="sim-neural-reset">
                    <div className="scanning-bar"></div>
                    <div className="focus-point"></div>
                </div>
            );
        }
        if (active === 3) { // NSDR
            return (
                <div className="sim-nsdr">
                    <div className="slow-pulse"></div>
                    <div className="expanding-ripple"></div>
                </div>
            );
        }
        if (active === 4) { // Digital Silence
            return (
                <div className="sim-digital-silence">
                    <div className="static-noise"></div>
                    <div className="countdown-ring" style={{ width: 100, height: 100, border: '4px solid var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800 }}>
                        {activeEx.cycle - timer}s
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="mindfulness-hub">
            <div className="card" style={{ marginBottom: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">🧘 Mindfulness Hub</div>
                        <div className="card-subtitle">Active recovery tools for cognitive stability</div>
                    </div>
                    {active && <button className="btn btn-ghost btn-sm" onClick={() => setActive(null)}>Exit Session</button>}
                </div>
                {!active ? (
                    <div className="grid-2" style={{ marginTop: 20 }}>
                        {exercises.map(ex => (
                            <div
                                key={ex.id}
                                className={`stat-card glass ${active === ex.id ? 'active' : ''}`}
                                style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
                                onClick={() => setActive(ex.id)}
                            >
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{ex.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{ex.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{ex.duration}</div>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10 }}>{ex.desc}</p>
                                <button className="btn btn-primary btn-sm" style={{ marginTop: 15, width: '100%' }}>Start Session</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="session-container" style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
                            {getSimulation()}
                        </div>
                        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: 4 }}>
                            {activeEx.steps[step]}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 18, marginTop: 10 }}>
                            {activeEx.title} Mode • Cycle {timer + 1}/{activeEx.cycle}s
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
