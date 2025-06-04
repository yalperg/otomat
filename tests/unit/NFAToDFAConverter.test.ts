import { Automaton, NFAToDFAConverter, SimulationEngine } from "@/index";

describe('NFAToDFAConverter', () => {
  it('converts a simple NFA to an equivalent DFA', () => {
    // NFA: accepts strings ending with "ab"
    const nfa = new Automaton({
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitions: [
        { from: 'q0', input: 'a', to: ['q0', 'q1'] },
        { from: 'q0', input: 'b', to: ['q0'] },
        { from: 'q1', input: 'b', to: ['q2'] },
      ],
      startStates: ['q0'],
      acceptStates: ['q2'],
    });
    const dfa = NFAToDFAConverter.convert(nfa);
    // DFA should be valid and deterministic
    expect(dfa.isDFA()).toBe(true);
    // DFA should accept the same language as the NFA for a sample set
    const accepts = [
      '',
      'a',
      'b',
      'ab',
      'aab',
      'aabb',
      'abab',
      'aaab',
      'baab',
      'babab',
    ];
    const nfaAccepts = accepts.map((w) => SimulationEngine.simulate(nfa, w));
    const dfaAccepts = accepts.map((w) => SimulationEngine.simulate(dfa, w));
    expect(dfaAccepts).toEqual(nfaAccepts);
  });

  it('produces correct DFA for NFA with unreachable states', () => {
    const nfa = new Automaton({
      states: ['q0', 'q1', 'q2', 'dead'],
      alphabet: ['0', '1'],
      transitions: [
        { from: 'q0', input: '0', to: ['q0', 'q1'] },
        { from: 'q1', input: '1', to: ['q2'] },
      ],
      startStates: ['q0'],
      acceptStates: ['q2'],
    });
    const dfa = NFAToDFAConverter.convert(nfa);
    // DFA should not include unreachable subset states
    expect(Array.from(dfa.states).some((s) => s.includes('dead'))).toBe(false);
  });

  it('throws if input is not an NFA', () => {
    const dfa = new Automaton({
      states: ['q0', 'q1'],
      alphabet: ['a'],
      transitions: [{ from: 'q0', input: 'a', to: ['q1'] }],
      startStates: ['q0'],
      acceptStates: ['q1'],
    });
    expect(() => NFAToDFAConverter.convert(dfa)).toThrow();
  });

  it('correctly converts an NFA with epsilon (ε) transitions to DFA', () => {
    // NFA: accepts strings ending with 'b', epsilon ile q0 -> q1
    const nfa = new Automaton({
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitions: [
        { from: 'q0', input: 'ε', to: ['q1'] }, // epsilon transition
        { from: 'q1', input: 'b', to: ['q2'] },
        { from: 'q0', input: 'a', to: ['q0'] },
        { from: 'q1', input: 'a', to: ['q1'] },
        { from: 'q2', input: 'a', to: ['q2'] },
        { from: 'q2', input: 'b', to: ['q2'] },
      ],
      startStates: ['q0'],
      acceptStates: ['q2'],
    });
    const dfa = NFAToDFAConverter.convert(nfa);
    expect(dfa.isDFA()).toBe(true);
    const accepts = [
      '',
      'a',
      'b',
      'ab',
      'aab',
      'aaab',
      'ba',
      'bba',
      'aabbb',
      'aaaab',
    ];
    const nfaAccepts = accepts.map((w) => SimulationEngine.simulate(nfa, w));
    const dfaAccepts = accepts.map((w) => SimulationEngine.simulate(dfa, w));
    expect(dfaAccepts).toEqual(nfaAccepts);
  });

  it('returns DFA and step-by-step conversion steps when stepByStep: true', () => {
    // NFA: accepts strings ending with "ab"
    const nfa = new Automaton({
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitions: [
        { from: 'q0', input: 'a', to: ['q0', 'q1'] },
        { from: 'q0', input: 'b', to: ['q0'] },
        { from: 'q1', input: 'b', to: ['q2'] },
      ],
      startStates: ['q0'],
      acceptStates: ['q2'],
    });
    const { dfa, steps } = NFAToDFAConverter.convert(nfa, { stepByStep: true });
    expect(dfa.isDFA()).toBe(true);
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
    // Each step should have required properties
    for (const step of steps) {
      expect(typeof step.currentSubset).toBe('string');
      expect(typeof step.isNewSubset).toBe('boolean');
      expect(Array.isArray(step.transitions)).toBe(true);
    }
    // DFA language equivalence (sample)
    const accepts = ['ab', 'aab', 'babab', ''];
    const nfaAccepts = accepts.map((w) => SimulationEngine.simulate(nfa, w));
    const dfaAccepts = accepts.map((w) => SimulationEngine.simulate(dfa, w));
    expect(dfaAccepts).toEqual(nfaAccepts);
  });

  it('step-by-step conversion includes epsilon transitions and correct step info', () => {
    // NFA: accepts strings ending with 'b', epsilon ile q0 -> q1
    const nfa = new Automaton({
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitions: [
        { from: 'q0', input: 'ε', to: ['q1'] },
        { from: 'q1', input: 'b', to: ['q2'] },
        { from: 'q0', input: 'a', to: ['q0'] },
        { from: 'q1', input: 'a', to: ['q1'] },
        { from: 'q2', input: 'a', to: ['q2'] },
        { from: 'q2', input: 'b', to: ['q2'] },
      ],
      startStates: ['q0'],
      acceptStates: ['q2'],
    });
    const { dfa, steps } = NFAToDFAConverter.convert(nfa, { stepByStep: true });
    // Steps should include at least one epsilon closure effect
    expect(steps.some(s => s.currentSubset.includes('q1'))).toBe(true);
    // DFA language equivalence (sample)
    const accepts = ['b', 'ab', 'aab', ''];
    const nfaAccepts = accepts.map((w) => SimulationEngine.simulate(nfa, w));
    const dfaAccepts = accepts.map((w) => SimulationEngine.simulate(dfa, w));
    expect(dfaAccepts).toEqual(nfaAccepts);
  });
});
