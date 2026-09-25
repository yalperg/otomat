import Otomat, { Automaton, EPSILON, InvalidAutomatonError } from '@/index';

describe('Otomat', () => {
  const config = () => ({
    states: ['s', 'f'],
    alphabet: ['a'],
    startStates: ['s'],
    acceptStates: ['f'],
    transitions: [{ from: 's', input: 'a', to: ['f'] }],
  });

  it('round-trips JSON including epsilon, Unicode and punctuation', () => {
    const nfa = new Automaton({
      states: ['q,"\\', '😀'],
      alphabet: ['word'],
      startStates: ['q,"\\'],
      acceptStates: ['😀'],
      transitions: [{ from: 'q,"\\', input: EPSILON, to: ['😀'] }],
    });
    expect(Otomat.parse(Otomat.serialize(nfa)).equals(nfa)).toBe(true);
    expect(Automaton.fromJSON(nfa.toJSON()).equals(nfa)).toBe(true);
    expect(Otomat.simulate(Otomat.parse(JSON.stringify(nfa)), '')).toBe(true);
  });

  it.each(['{bad json', '{}'])(
    'rejects invalid parsed definitions: %p',
    (input) => {
      expect(() => Automaton.fromJSON(input)).toThrow(InvalidAutomatonError);
    },
  );

  it('keeps delegated methods correctly bound when called through the facade or destructured', () => {
    const nfa = new Automaton({
      ...config(),
      transitions: [{ from: 's', input: EPSILON, to: ['f'] }],
    });
    const { simulate, convertNFAToDFA } = Otomat;
    const { dfa } = convertNFAToDFA(nfa, { stepByStep: true });
    expect(simulate(dfa, '')).toBe(true);
    expect(simulate(dfa, '', { stepByStep: true })[0].currentStates).toEqual([
      ...dfa.startStates,
    ]);
  });
});
