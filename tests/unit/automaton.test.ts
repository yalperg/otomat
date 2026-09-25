import { Automaton, SimulationEngine } from '@/index';
import { InvalidAutomatonError } from '@/errors/index';

describe('Automaton', () => {
  const configDFA = {
    states: ['q0', 'q1'],
    alphabet: ['a', 'b'],
    transitions: [
      { from: 'q0', input: 'a', to: ['q1'] },
      { from: 'q1', input: 'b', to: ['q0'] },
    ],
    startStates: ['q0'],
    acceptStates: ['q1'],
  };
  const configNFA = {
    states: ['q0', 'q1', 'q2'],
    alphabet: ['a', 'b'],
    transitions: [
      { from: 'q0', input: 'ε', to: ['q1'] },
      { from: 'q1', input: 'b', to: ['q2'] },
    ],
    startStates: ['q0'],
    acceptStates: ['q2'],
  };

  it('creates a valid DFA', () => {
    const a = new Automaton(configDFA);
    expect(a.states.has('q0')).toBe(true);
    expect(a.alphabet.has('a')).toBe(true);
    expect(a.transitions.length).toBe(2);
    expect(a.startStates.has('q0')).toBe(true);
    expect(a.acceptStates.has('q1')).toBe(true);
    expect(a.isDFA()).toBe(true);
    expect(a.isNFA()).toBe(false);
  });

  it('creates a valid NFA', () => {
    const a = new Automaton(configNFA);
    expect(a.isDFA()).toBe(false);
    expect(a.isNFA()).toBe(true);
  });

  it('throws for invalid state references', () => {
    const bad = {
      ...configDFA,
      transitions: [{ from: 'qX', input: 'a', to: ['q1'] }],
    };
    expect(() => new Automaton(bad)).toThrow(InvalidAutomatonError);
  });

  it('throws for invalid alphabet symbol in transition', () => {
    const bad = {
      ...configDFA,
      transitions: [{ from: 'q0', input: 'x', to: ['q1'] }],
    };
    expect(() => new Automaton(bad)).toThrow(InvalidAutomatonError);
  });

  it('throws for start state not in states', () => {
    const bad = { ...configDFA, startStates: ['qX'] };
    expect(() => new Automaton(bad)).toThrow(InvalidAutomatonError);
  });

  it('throws for accept state not in states', () => {
    const bad = { ...configDFA, acceptStates: ['qX'] };
    expect(() => new Automaton(bad)).toThrow(InvalidAutomatonError);
  });

  it('throws for empty states set', () => {
    const bad = { ...configDFA, states: [] };
    expect(() => new Automaton(bad)).toThrow(InvalidAutomatonError);
  });

  it('throws for empty alphabet', () => {
    const bad = { ...configDFA, alphabet: [] };
    expect(() => new Automaton(bad)).toThrow(InvalidAutomatonError);
  });

  it('equals() returns true for identical automata', () => {
    const a1 = new Automaton(configDFA);
    const a2 = new Automaton(configDFA);
    expect(a1.equals(a2)).toBe(true);
  });

  it('equals() returns false for different automata', () => {
    const a1 = new Automaton(configDFA);
    const a2 = new Automaton(configNFA);
    expect(a1.equals(a2)).toBe(false);
  });
});

describe('Automaton data ownership and equality', () => {
  const config = () => ({
    states: ['s', 'f'],
    alphabet: ['a'],
    startStates: ['s'],
    acceptStates: ['f'],
    transitions: [{ from: 's', input: 'a', to: ['f'] }],
  });

  it('recognizes branching across separate transition records', () => {
    const automaton = new Automaton({
      ...config(),
      transitions: [
        { from: 's', input: 'a', to: ['s'] },
        { from: 's', input: 'a', to: ['f'] },
      ],
    });
    expect(automaton.isDFA()).toBe(false);
    expect(automaton.isNFA()).toBe(true);
  });

  it('owns copies of configuration and exposes detached set snapshots', () => {
    const input = config();
    const automaton = new Automaton(input);
    input.transitions[0].to[0] = 's';
    input.states.push('extra');
    input.acceptStates.length = 0;
    automaton.states.clear();
    automaton.alphabet.clear();
    automaton.startStates.clear();
    automaton.acceptStates.clear();
    expect(automaton.states).toEqual(new Set(['s', 'f']));
    expect(SimulationEngine.simulate(automaton, 'a')).toBe(true);
  });

  it('modifying a lookup result cannot corrupt the automaton', () => {
    const automaton = new Automaton(config());
    automaton.getTransitions('s', 'a').pop();
    expect(SimulationEngine.simulate(automaton, 'a')).toBe(true);
  });

  it('rejects changes to transition destinations without changing accepted input', () => {
    const automaton = new Automaton(config());
    expect(() => {
      // @ts-expect-error Also verify the boundary for JavaScript callers.
      automaton.transitions[0].to.push('s');
    }).toThrow(TypeError);
    expect(SimulationEngine.simulate(automaton, 'a')).toBe(true);
    expect(SimulationEngine.simulate(automaton, 'aa')).toBe(false);
  });

  it('deduplicates lookup targets without confusing identical records with branching', () => {
    const input = config();
    input.transitions.push(input.transitions[0]);
    const automaton = new Automaton(input);
    expect(automaton.isDFA()).toBe(true);
    expect(automaton.getTransitions('s', 'a')).toEqual(['f']);
  });

  it('compares transition multisets independent of record and target order', () => {
    const input = config();
    const t = { from: 's', input: 'a', to: ['s', 'f'] };
    const u = { from: 'f', input: 'a', to: ['s'] };
    const a = new Automaton({ ...input, transitions: [t, u, t] });
    const b = new Automaton({
      ...input,
      transitions: [u, { ...t, to: ['f', 's'] }, t],
    });
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);
    expect(a.equals(new Automaton({ ...input, transitions: [t, u] }))).toBe(
      false,
    );
  });

  it('equality is symmetric and cannot hide a different transition behind duplicates', () => {
    const config = {
      states: ['s', 'f'],
      alphabet: ['a'],
      startStates: ['s'],
      acceptStates: ['f'],
    };
    const t = { from: 's', input: 'a', to: ['f'] };
    const u = { from: 'f', input: 'a', to: ['s'] };
    const left = new Automaton({ ...config, transitions: [t, t] });
    const right = new Automaton({ ...config, transitions: [t, u] });
    expect(left.equals(right)).toBe(right.equals(left));
    expect(left.equals(right)).toBe(false);
  });
});
