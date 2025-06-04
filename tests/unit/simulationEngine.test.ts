import { Automaton, SimulationEngine, Transition } from '@/index';

describe('SimulationEngine', () => {
  describe('DFA simulation', () => {
    // DFA for language: even number of 0s (over {0,1})
    const dfa = new Automaton({
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      transitions: [
        Transition.create('q0', '0', ['q1']),
        Transition.create('q0', '1', ['q0']),
        Transition.create('q1', '0', ['q0']),
        Transition.create('q1', '1', ['q1']),
      ],
      startStates: ['q0'],
      acceptStates: ['q0'],
    });

    it('accepts strings with even number of 0s', () => {
      expect(SimulationEngine.simulate(dfa, '', { stepByStep: false })).toBe(
        true,
      );
      expect(SimulationEngine.simulate(dfa, '1', { stepByStep: false })).toBe(
        true,
      );
      expect(SimulationEngine.simulate(dfa, '00', { stepByStep: false })).toBe(
        true,
      );
      expect(
        SimulationEngine.simulate(dfa, '110011', { stepByStep: false }),
      ).toBe(true);
      expect(SimulationEngine.simulate(dfa, '001', { stepByStep: false })).toBe(
        true,
      );
    });

    it('rejects strings with odd number of 0s', () => {
      expect(SimulationEngine.simulate(dfa, '0', { stepByStep: false })).toBe(
        false,
      );
      expect(SimulationEngine.simulate(dfa, '10', { stepByStep: false })).toBe(
        false,
      );
    });

    it('throws on invalid input symbol', () => {
      expect(() =>
        SimulationEngine.simulate(dfa, '2', { stepByStep: false }),
      ).toThrow();
      expect(() =>
        SimulationEngine.simulate(dfa, '0a', { stepByStep: false }),
      ).toThrow();
    });

    it('step-by-step simulation matches fast mode and tracks states', () => {
      const input = '0011';
      const fastResult = SimulationEngine.simulate(dfa, input, {
        stepByStep: false,
      });
      const steps = SimulationEngine.simulate(dfa, input, {
        stepByStep: true,
      });
      if (Array.isArray(steps)) {
        // Should have input.length + 1 steps (initial + one per symbol)
        expect(steps.length).toBe(input.length + 1);
        // Initial state
        expect(steps[0]?.currentStates).toEqual(['q0']);
        // Step-by-step state progression
        expect(steps[1]?.currentStates).toEqual(['q1']); // after '0'
        expect(steps[2]?.currentStates).toEqual(['q0']); // after '0'
        expect(steps[3]?.currentStates).toEqual(['q0']); // after '1'
        expect(steps[4]?.currentStates).toEqual(['q0']); // after '1'
        // Final state is accept state, so fast and step-by-step agree
        const finalStates = steps[steps.length - 1]?.currentStates;
        const isAccept = finalStates?.some((s: string) =>
          dfa.acceptStates.has(s),
        );
        expect(isAccept).toBe(fastResult);
      }
    });
  });

  describe('NFA simulation', () => {
    // NFA for language: ends with 01 (over {0,1})
    const nfa = new Automaton({
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      transitions: [
        Transition.create('q0', '0', ['q0', 'q1']),
        Transition.create('q0', '1', ['q0']),
        Transition.create('q1', '1', ['q2']),
      ],
      startStates: ['q0'],
      acceptStates: ['q2'],
    });

    it('accepts strings ending with 01', () => {
      expect(SimulationEngine.simulate(nfa, '01', { stepByStep: false })).toBe(
        true,
      );
      expect(
        SimulationEngine.simulate(nfa, '1001', { stepByStep: false }),
      ).toBe(true);
      expect(
        SimulationEngine.simulate(nfa, '00001', { stepByStep: false }),
      ).toBe(true);
    });

    it('rejects strings not ending with 01', () => {
      expect(SimulationEngine.simulate(nfa, '', { stepByStep: false })).toBe(
        false,
      );
      expect(SimulationEngine.simulate(nfa, '0', { stepByStep: false })).toBe(
        false,
      );
      expect(SimulationEngine.simulate(nfa, '10', { stepByStep: false })).toBe(
        false,
      );
      expect(SimulationEngine.simulate(nfa, '011', { stepByStep: false })).toBe(
        false,
      );
    });

    it('handles multiple active states', () => {
      expect(
        SimulationEngine.simulate(nfa, '0001', { stepByStep: false }),
      ).toBe(true);
    });

    it('step-by-step simulation tracks multiple active states and transitions', () => {
      const input = '0011';
      const fastResult = SimulationEngine.simulate(nfa, input, {
        stepByStep: false,
      });
      const steps = SimulationEngine.simulate(nfa, input, {
        stepByStep: true,
      });
      if (Array.isArray(steps)) {
        // Should have input.length + 1 steps (initial + one per symbol)
        expect(steps.length).toBe(input.length + 1);
        // Initial state
        expect(steps[0]?.currentStates).toEqual(['q0']);
        // After first '0': from q0, can go to q0 and q1
        expect(new Set(steps[1]?.currentStates)).toEqual(new Set(['q0', 'q1']));
        // After second '0': from q0->q0,q1 and q1 has no '0' transition
        expect(new Set(steps[2]?.currentStates)).toEqual(new Set(['q0', 'q1']));
        // After first '1': q0->q0, q1->q2
        expect(new Set(steps[3]?.currentStates)).toEqual(new Set(['q0', 'q2']));
        // After second '1': q0->q0, q2 has no '1' transition
        expect(new Set(steps[4]?.currentStates)).toEqual(new Set(['q0']));
        // Final state is not accept, so fast and step-by-step agree
        const finalStates = steps[steps.length - 1]?.currentStates;
        const isAccept = finalStates?.some((s: string) =>
          nfa.acceptStates.has(s),
        );
        expect(isAccept).toBe(fastResult);
        // Check input symbols and transitions at each step
        for (let i = 1; i < steps.length; ++i) {
          expect(steps[i]?.inputSymbol).toBe(input[i - 1]);
          // Transitions: at least one transition per active state if possible
          if ((steps[i]?.currentStates ?? []).length > 0) {
            expect(Array.isArray(steps[i - 1]?.currentStates)).toBe(true);
          }
        }
      }
    });

    it('supports epsilon (ε) transitions in NFA simulation', () => {
      // NFA: accepts any string ending with 'b', or any string with an epsilon path to accept
      const nfa = new Automaton({
        states: ['q0', 'q1', 'q2'],
        alphabet: ['a', 'b'],
        transitions: [
          Transition.create('q0', 'a', ['q0']),
          Transition.create('q0', 'b', ['q0']),
          Transition.create('q0', 'ε', ['q1']),
          Transition.create('q1', 'a', ['q1']),
          Transition.create('q1', 'b', ['q2']),
        ],
        startStates: ['q0'],
        acceptStates: ['q2'],
      });
      // 'aab' can reach q2 via epsilon from q0 to q1, then 'b' to q2
      expect(SimulationEngine.simulate(nfa, 'aab')).toBe(true);
      // 'b' can reach q2 via epsilon from q0 to q1, then 'b' to q2
      expect(SimulationEngine.simulate(nfa, 'b')).toBe(true);
      // 'aaa' cannot reach q2
      expect(SimulationEngine.simulate(nfa, 'aaa')).toBe(false);
      // '' (empty string) cannot reach q2
      expect(SimulationEngine.simulate(nfa, '')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    // DFA with single state, accepts only empty string
    const dfa = new Automaton({
      states: ['s'],
      alphabet: ['a'],
      transitions: [],
      startStates: ['s'],
      acceptStates: ['s'],
    });
    it('accepts empty input if start is accept', () => {
      expect(SimulationEngine.simulate(dfa, '', { stepByStep: false })).toBe(
        true,
      );
    });
    it('rejects nonempty input if no transitions', () => {
      expect(SimulationEngine.simulate(dfa, 'a', { stepByStep: false })).toBe(
        false,
      );
    });
  });
});
