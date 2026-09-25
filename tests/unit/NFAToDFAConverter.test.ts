import { Automaton, NFAToDFAConverter, SimulationEngine } from '@/index';

describe('NFAToDFAConverter', () => {
  it('converts a simple NFA to an equivalent DFA', () => {
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
    expect(dfa.isDFA()).toBe(true);
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
    for (const step of steps) {
      expect(typeof step.currentSubset).toBe('string');
      expect(typeof step.isNewSubset).toBe('boolean');
      expect(Array.isArray(step.transitions)).toBe(true);
    }
    const accepts = ['ab', 'aab', 'babab', ''];
    const nfaAccepts = accepts.map((w) => SimulationEngine.simulate(nfa, w));
    const dfaAccepts = accepts.map((w) => SimulationEngine.simulate(dfa, w));
    expect(dfaAccepts).toEqual(nfaAccepts);
  });

  it('step-by-step conversion includes epsilon transitions and correct step info', () => {
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
    expect(steps.some((s) => s.currentSubset.includes('q1'))).toBe(true);
    const accepts = ['b', 'ab', 'aab', ''];
    const nfaAccepts = accepts.map((w) => SimulationEngine.simulate(nfa, w));
    const dfaAccepts = accepts.map((w) => SimulationEngine.simulate(dfa, w));
    expect(dfaAccepts).toEqual(nfaAccepts);
  });
});

describe('Conversion edge cases', () => {
  const config = () => ({
    states: ['s', 'f'],
    alphabet: ['a'],
    startStates: ['s'],
    acceptStates: ['f'],
    transitions: [{ from: 's', input: 'a', to: ['f'] }],
  });

  it('converts branching expressed as separate transition records', () => {
    const nfa = new Automaton({
      ...config(),
      transitions: [
        { from: 's', input: 'a', to: ['s'] },
        { from: 's', input: 'a', to: ['f'] },
      ],
    });
    const dfa = NFAToDFAConverter.convert(nfa);
    expect(SimulationEngine.simulate(dfa, '')).toBe(false);
    expect(SimulationEngine.simulate(dfa, 'a')).toBe(true);
    expect(SimulationEngine.simulate(dfa, 'aa')).toBe(true);
  });

  it.each([false, true])(
    'keeps a state named "a, b" distinct from the pair "a" and "b" (trace=%s)',
    (trace) => {
      const nfa = new Automaton({
        states: ['s', 'a', 'b', 'a, b'],
        alphabet: ['x', 'y'],
        startStates: ['s'],
        acceptStates: ['a'],
        transitions: [
          { from: 's', input: 'x', to: ['a', 'b'] },
          { from: 's', input: 'y', to: ['a, b'] },
        ],
      });
      const dfa = trace
        ? NFAToDFAConverter.convert(nfa, { stepByStep: true }).dfa
        : NFAToDFAConverter.convert(nfa);
      expect(SimulationEngine.simulate(nfa, 'x')).toBe(true);
      expect(SimulationEngine.simulate(nfa, 'y')).toBe(false);
      expect(SimulationEngine.simulate(dfa, 'x')).toBe(true);
      expect(SimulationEngine.simulate(dfa, 'y')).toBe(false);
    },
  );

  it('preserves partial-DFA rejection and records missing transitions', () => {
    const nfa = new Automaton({
      ...config(),
      transitions: [{ from: 's', input: 'ε', to: ['f'] }],
    });
    const { dfa, steps } = NFAToDFAConverter.convert(nfa, { stepByStep: true });
    expect(dfa.states.size).toBe(1);
    expect(steps).toEqual([
      {
        currentSubset: [...dfa.startStates][0],
        symbol: 'a',
        nextSubset: undefined,
        isNewSubset: false,
        transitions: [],
      },
    ]);
    expect(SimulationEngine.simulate(dfa, '')).toBe(true);
    expect(SimulationEngine.simulate(dfa, 'a')).toBe(false);
  });

  it('keeps direct conversion, traced conversion and recorded edges consistent', () => {
    const nfa = new Automaton({
      ...config(),
      transitions: [{ from: 's', input: 'a', to: ['s', 'f'] }],
    });
    const direct = NFAToDFAConverter.convert(nfa);
    const { dfa, steps } = NFAToDFAConverter.convert(nfa, { stepByStep: true });
    expect(dfa.equals(direct)).toBe(true);
    expect(steps.flatMap((step) => step.transitions)).toEqual(
      dfa.transitions.map((t) => ({
        from: t.from,
        input: t.input,
        to: t.to[0],
      })),
    );
  });
});

// Expected languages are independent of the NFA simulator and converter.
describe('Language preservation', () => {
  const examples = [
    {
      name: 'words ending in ab',
      language: /ab$/,
      config: {
        states: ['start', 'saw-a', 'accept'],
        alphabet: ['a', 'b'],
        startStates: ['start'],
        acceptStates: ['accept'],
        transitions: [
          { from: 'start', input: 'a', to: ['start', 'saw-a'] },
          { from: 'start', input: 'b', to: ['start'] },
          { from: 'saw-a', input: 'b', to: ['accept'] },
        ],
      },
    },
    {
      name: 'zero or more a symbols through an epsilon cycle',
      language: /^a*$/,
      config: {
        states: ['start', 'accept'],
        alphabet: ['a', 'b'],
        startStates: ['start'],
        acceptStates: ['accept'],
        transitions: [
          { from: 'start', input: 'ε', to: ['accept'] },
          { from: 'accept', input: 'ε', to: ['start'] },
          { from: 'accept', input: 'a', to: ['accept'] },
        ],
      },
    },
    {
      name: 'only a symbols or only b symbols from separate start states',
      language: /^(a+|b+)$/,
      config: {
        states: ['start-a', 'start-b', 'accept-a', 'accept-b'],
        alphabet: ['a', 'b'],
        startStates: ['start-a', 'start-b'],
        acceptStates: ['accept-a', 'accept-b'],
        transitions: [
          { from: 'start-a', input: 'a', to: ['accept-a'] },
          { from: 'accept-a', input: 'a', to: ['accept-a'] },
          { from: 'start-b', input: 'b', to: ['accept-b'] },
          { from: 'accept-b', input: 'b', to: ['accept-b'] },
        ],
      },
    },
  ];

  it.each(examples)(
    'recognizes $name before and after conversion',
    ({ config, language }) => {
      const nfa = new Automaton(config);
      const dfa = NFAToDFAConverter.convert(nfa);
      const tracedDfa = NFAToDFAConverter.convert(nfa, {
        stepByStep: true,
      }).dfa;
      const words = binaryWordsUpToLength(4);
      const expected = words.map((word) => ({
        word,
        accepted: language.test(word),
      }));

      for (const automaton of [nfa, dfa, tracedDfa]) {
        const actual = words.map((word) => ({
          word,
          accepted: SimulationEngine.simulate(automaton, word),
        }));
        expect(actual).toEqual(expected);
      }
    },
  );
});

function binaryWordsUpToLength(maxLength: number): string[] {
  const words = [''];
  let currentLength = [''];
  for (let length = 1; length <= maxLength; length++) {
    currentLength = currentLength.flatMap((prefix) =>
      ['a', 'b'].map((symbol) => prefix + symbol),
    );
    words.push(...currentLength);
  }
  return words;
}
