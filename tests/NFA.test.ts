import NFA from "../src/lib/NFA";
import { State, Transition, Alphabet } from "../src/types";

describe("NFA class", () => {
  describe("toDFA method", () => {
    test("should convert an NFA with a single state and no transitions to a DFA", () => {
      const stateQ0: State = "q0";
      const nfa = new NFA([stateQ0], [], stateQ0, [stateQ0], []);

      const dfa = nfa.toDFA(true);

      expect(dfa.states).toHaveLength(1);
      expect(dfa.states[0]).toBe(stateQ0);
      expect(dfa.startState).toBe(stateQ0);
      expect(dfa.acceptStates).toEqual([stateQ0]);
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
      expect(dfa.acceptStates).toEqual(["q0,q1,q2"]);
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
      expect(dfa.states).toHaveLength(4);
      expect(dfa.startState).toBe("q0");
      expect(dfa.acceptStates).toContain("q2");
      expect(dfa.transitions).toHaveLength(8);
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

      expect(dfa.states).not.toContain(stateQ3);
      expect(dfa.transitions).not.toContainEqual(
        expect.objectContaining({ from: stateQ3 }),
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

      const closure = nfa["epsilonClosure"](new Set([stateQ0]));
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
