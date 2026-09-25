import DotExporter from '@/DotExporter';
import { Automaton } from '@/index';

describe('DotExporter', () => {
  it('exports a simple DFA to DOT format', () => {
    const dfa = new Automaton({
      states: ['q0', 'q1'],
      alphabet: ['a', 'b'],
      transitions: [
        { from: 'q0', input: 'a', to: ['q1'] },
        { from: 'q1', input: 'b', to: ['q0'] },
      ],
      startStates: ['q0'],
      acceptStates: ['q1'],
    });
    const dot = DotExporter.export(dfa);
    expect(dot).toContain('digraph Automaton');
    expect(dot).toContain('q0');
    expect(dot).toContain('q1');
    expect(dot).toContain('->');
    expect(dot).toContain('rankdir=LR');
    expect(dot).toContain('shape=doublecircle');
  });

  it('exports an NFA with non-deterministic transitions', () => {
    const nfa = new Automaton({
      states: ['s', 't'],
      alphabet: ['x', 'y'],
      transitions: [
        { from: 's', input: 'x', to: ['s', 't'] },
        { from: 't', input: 'y', to: ['s'] },
      ],
      startStates: ['s'],
      acceptStates: ['t'],
    });
    const dot = DotExporter.export(nfa);
    expect(dot).toContain('"s" -> "s" [label="x"]');
    expect(dot).toContain('"s" -> "t" [label="x"]');
    expect(dot).toContain('"t" -> "s" [label="y"]');
  });

  it('escapes special characters in state names and labels', () => {
    const automaton = new Automaton({
      states: ['a"b', 'c\\d'],
      alphabet: ['z'],
      transitions: [{ from: 'a"b', input: 'z', to: ['c\\d'] }],
      startStates: ['a"b'],
      acceptStates: ['c\\d'],
    });
    const dot = DotExporter.export(automaton);
    expect(dot).toContain('"a\\"b"');
    expect(dot).toContain('"c\\\\d"');
    expect(dot).toContain('label="z"');
  });
});

describe('Distinct graph nodes and edges', () => {
  it('preserves both edges when state names contain double underscores', () => {
    const automaton = new Automaton({
      states: ['a__b', 'c', 'a', 'b__c'],
      alphabet: ['x', 'y'],
      startStates: ['a'],
      acceptStates: ['c'],
      transitions: [
        { from: 'a__b', input: 'x', to: ['c'] },
        { from: 'a', input: 'y', to: ['b__c'] },
      ],
    });
    const dot = DotExporter.export(automaton);
    expect(dot).toContain('"a__b" -> "c" [label="x"]');
    expect(dot).toContain('"a" -> "b__c" [label="y"]');
  });

  it('keeps start markers separate from states named start_q and _start_q', () => {
    const automaton = new Automaton({
      states: ['q', 'start_q', '_start_q', '_q'],
      alphabet: ['a'],
      startStates: ['q', '_q'],
      acceptStates: ['start_q'],
      transitions: [],
    });
    const dot = DotExporter.export(automaton);
    const markers = [
      ...dot.matchAll(/"([^"\n]+)" \[shape=point, style=invis\]/g),
    ].map((match) => match[1]);
    expect(markers).toHaveLength(2);
    expect(new Set(markers).size).toBe(2);
    for (const marker of markers)
      expect(automaton.states.has(marker)).toBe(false);
  });
});
