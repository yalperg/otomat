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
