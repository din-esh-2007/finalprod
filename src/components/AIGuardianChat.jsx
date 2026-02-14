import { useState, useEffect } from 'react';

export default function AIGuardianChat({ metrics }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I am your Cognitive Guardian. I monitor your neural load and stability signals. How can I support your focus today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSend(e) {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Simulate AI Guardian response based on metrics
        setTimeout(() => {
            let response = "";
            const phase = metrics?.burnout_phase || 1;
            const load = metrics?.neural_load_index || 0;

            if (input.toLowerCase().includes('how am i')) {
                if (phase >= 3) {
                    response = `Your current phase is ${phase}. Your neural load is quite high (${Math.round(load)}%). I recommend activating Detox Mode or taking a 15-minute cognitive break. Your fragmentation index suggests you are switching tasks too frequently.`;
                } else {
                    response = `You are currently in Phase ${phase}. Your stability is strong. You have high adaptive capacity today. Keep going, but remember to take micro-breaks every 90 minutes.`;
                }
            } else if (input.toLowerCase().includes('break')) {
                response = "Based on your behavior patterns, I suggest a 'Non-Sleep Deep Rest' (NSDR) break for 10 minutes to reset your latent stress levels.";
            } else {
                response = "I've analyzed your current cognitive load. Whether you are feeling productive or tired, I am here to ensure you don't cross into Phase 4 (Collapse Risk). Would you like me to suggest a recovery strategy for your current workload?";
            }

            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
            setLoading(false);
        }, 1000);
    }

    return (
        <div className="card" style={{ marginTop: 20, height: 450, display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                    <div className="card-title">🤖 AI Guardian Companion</div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 15px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        fontSize: 13,
                        lineHeight: 1.5,
                        background: m.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                        border: m.role === 'assistant' ? '1px solid var(--border)' : 'none'
                    }}>
                        {m.text}
                    </div>
                ))}
                {loading && <div className="spinner" style={{ width: 16, height: 16 }}></div>}
            </div>

            <form onSubmit={handleSend} style={{ padding: 15, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input
                    className="form-input"
                    placeholder="Ask your Guardian about your stability..."
                    style={{ margin: 0 }}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>Send</button>
            </form>
        </div>
    );
}
