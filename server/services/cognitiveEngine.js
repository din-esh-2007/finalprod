/**
 * Cognitive Stability Engine
 * Handles calculation of advanced cognitive indices and burnout phases.
 */

function calculateFragmentation(taskSwitchingRate, backspaceRate, meetingOverlap = 0) {
    // Logic: Higher task switching and backspace rate (corrections) indicate higher fragmentation
    const score = (taskSwitchingRate * 40) + (backspaceRate * 0.5) + (meetingOverlap * 20);
    return Math.min(100, Math.max(0, score));
}

function calculateLatentStress(volatility, sleepDeviation = 0) {
    // Logic: Time-decay accumulation of micro-spikes
    const baseStress = volatility * 1.5 + sleepDeviation * 10;
    return Math.min(100, Math.max(0, baseStress));
}

function calculateAdaptiveCapacity(prevStress, currentStress, recoveryRatio) {
    // Logic: Measures normalization speed after strain
    const capacity = 100 - (currentStress * 0.5) + (recoveryRatio * 20);
    return Math.min(100, Math.max(0, capacity));
}

function calculateNeuralLoad(kpm, fragmentation, stress) {
    // Logic: Typing strain + cognitive load
    const load = (kpm / 2) + (fragmentation * 0.3) + (stress * 0.2);
    return Math.min(100, Math.max(0, load));
}

function classifyBurnoutPhase(neuralLoad, adaptiveCapacity) {
    // Phase 1 - Silent Accumulation: Low load, High capacity
    // Phase 2 - Functional Overdrive: High load, High capacity
    // Phase 3 - Volatility Escalation: High load, Low capacity
    // Phase 4 - Collapse Risk: Very high load, Very low capacity

    if (neuralLoad > 80 && adaptiveCapacity < 30) return 4;
    if (neuralLoad > 60 && adaptiveCapacity < 50) return 3;
    if (neuralLoad > 40) return 2;
    return 1;
}

function getPhaseDescription(phase) {
    const phases = {
        1: { name: 'Silent Accumulation', color: '#10b981', desc: 'Stability is good, but micro-stress is gathering.' },
        2: { name: 'Functional Overdrive', color: '#6366f1', desc: 'High performance maintained via high effort.' },
        3: { name: 'Volatility Escalation', color: '#f59e0b', desc: 'Frequent stability spikes; recovery slowing down.' },
        4: { name: 'Collapse Risk', color: '#ef4444', desc: 'Critical neural load; high probability of performance drop.' }
    };
    return phases[phase] || phases[1];
}

module.exports = {
    calculateFragmentation,
    calculateLatentStress,
    calculateAdaptiveCapacity,
    calculateNeuralLoad,
    classifyBurnoutPhase,
    getPhaseDescription
};
