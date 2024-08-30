import NFA from "../models/NFA";
import { State, Transition, Alphabet } from "../types";

describe("NFA class", () => {
  describe("toDFA method", () => {
    test("should convert an NFA with a single state and no transitions to a DFA", () => {
      const stateQ0: State = "q0";
      const nfa = new NFA([stateQ0], [], stateQ0, [stateQ0], []);

      const dfa = nfa.toDFA(true);

      expect(dfa.states).toHaveLength(1);
      expect(dfa.states[0]).toBe(stateQ0);
      expect(dfa.startState).toBe(dfa.states[0]);
      expect(dfa.acceptStates).toEqual(dfa.states);
      expect(dfa.transitions).toHaveLength(0);
    });

    test("should convert an NFA with epsilon transitions to a DFA", () => {
      const stateQ0: State = "q0";
      const stateQ1: State = "q1";
      const stateQ2: State = "q2";

      const transitions: Transition[] = [
        { from: stateQ0, to: stateQ1, symbol: "ε" },
        { from: stateQ1, to: stateQ2, symbol: "ε" },
      ];

      const alphabet: Alphabet = ["ε"];
      const nfa = new NFA(
        [stateQ0, stateQ1, stateQ2],
        transitions,
        stateQ0,
        [stateQ2],
        alphabet,
      );

      const dfa = nfa.toDFA(true);

      expect(dfa.states).toHaveLength(1);
      expect(dfa.states[0]).toBe("q0,q1,q2");
      expect(dfa.startState).toBe("q0,q1,q2");
      expect(dfa.acceptStates).toEqual(dfa.states);
      expect(dfa.transitions).toHaveLength(0);
    });

    test("should convert an NFA with multiple states and transitions to a DFA", () => {
      const stateQ0: State = "q0";
      const stateQ1: State = "q1";
      const stateQ2: State = "q2";

      const transitions: Transition[] = [
        { from: stateQ0, to: stateQ1, symbol: "0" },
        { from: stateQ1, to: stateQ2, symbol: "1" },
        { from: stateQ2, to: stateQ0, symbol: "0" },
        { from: stateQ0, to: stateQ2, symbol: "1" },
        { from: stateQ1, to: stateQ0, symbol: "0" },
      ];

      const alphabet: Alphabet = ["0", "1"];
      const nfa = new NFA(
        [stateQ0, stateQ1, stateQ2],
        transitions,
        stateQ0,
        [stateQ2],
        alphabet,
      );

      const dfa = nfa.toDFA(true);
      expect(dfa.states.length).toBeGreaterThan(0);
      expect(dfa.startState!).toBe(stateQ0);
      expect(
        dfa.acceptStates.some((state) => state.includes("q2")),
      ).toBeTruthy();
      expect(dfa.transitions.length).toBeGreaterThan(0);
    });

    test("should remove unreachable states in DFA", () => {
      const stateQ0: State = "q0";
      const stateQ1: State = "q1";
      const stateQ2: State = "q2";
      const stateQ3: State = "q3";

      const transitions: Transition[] = [
        { from: stateQ0, to: stateQ1, symbol: "0" },
        { from: stateQ1, to: stateQ2, symbol: "1" },
        { from: stateQ2, to: stateQ0, symbol: "0" },
        { from: stateQ0, to: stateQ2, symbol: "1" },
        { from: stateQ1, to: stateQ0, symbol: "0" },
        { from: stateQ2, to: stateQ1, symbol: "1" },
        { from: stateQ3, to: stateQ3, symbol: "0" }, // Unreachable state
        { from: stateQ3, to: stateQ3, symbol: "1" }, // Unreachable state
      ];

      const alphabet: Alphabet = ["0", "1"];
      const nfa = new NFA(
        [stateQ0, stateQ1, stateQ2, stateQ3],
        transitions,
        stateQ0,
        [stateQ2],
        alphabet,
      );

      const dfa = nfa.toDFA(true);

      expect(dfa.states).not.toContainEqual(
        expect.objectContaining({ name: stateQ3 }),
      );
      expect(dfa.transitions).not.toContainEqual(
        expect.objectContaining({
          from: expect.objectContaining({ name: stateQ3 }),
        }),
      );
    });
  });

  describe("epsilonClosure method", () => {
    test("should compute epsilon closure correctly", () => {
      const stateQ0: State = "q0";
      const stateQ1: State = "q1";
      const stateQ2: State = "q2";

      const transitions: Transition[] = [
        { from: stateQ0, to: stateQ1, symbol: "ε" },
        { from: stateQ1, to: stateQ2, symbol: "ε" },
      ];

      const alphabet: Alphabet = ["ε"];
      const nfa = new NFA(
        [stateQ0, stateQ1, stateQ2],
        transitions,
        stateQ0,
        [stateQ2],
        alphabet,
      );

      const closure = nfa["epsilonClosure"](stateQ0);
      expect(closure.size).toBe(3);
      expect(closure.has(stateQ0)).toBeTruthy();
      expect(closure.has(stateQ1)).toBeTruthy();
      expect(closure.has(stateQ2)).toBeTruthy();
    });
  });

  describe("move method", () => {
    test("should compute move correctly", () => {
      const stateQ0: State = "q0";
      const stateQ1: State = "q1";
      const stateQ2: State = "q2";

      const transitions: Transition[] = [
        { from: stateQ0, to: stateQ1, symbol: "0" },
        { from: stateQ0, to: stateQ2, symbol: "1" },
        { from: stateQ1, to: stateQ2, symbol: "1" },
      ];

      const alphabet: Alphabet = ["0", "1"];
      const nfa = new NFA(
        [stateQ0, stateQ1, stateQ2],
        transitions,
        stateQ0,
        [stateQ2],
        alphabet,
      );

      const moveResult = nfa["move"](new Set([stateQ0, stateQ1]), "1");
      expect(moveResult.size).toBe(1);
      expect(moveResult.has(stateQ2)).toBeTruthy();
    });
  });
});
