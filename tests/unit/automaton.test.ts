import { Automaton } from '@/index';
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
