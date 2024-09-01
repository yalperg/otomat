import NFA from "../src/core/NFA";
import { State, Transition, Alphabet } from "../src/types";

describe("NFA class", () => {
  describe("toDFA method", () => {
    test("should convert an NFA with a single state and no transitions to a DFA", () => {
      const stateQ0: State = "q0";
      const nfa = new NFA([stateQ0], [], stateQ0, [stateQ0], []);

      const dfa = nfa.toDFA();

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

      const dfa = nfa.toDFA();

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

      const dfa = nfa.toDFA();
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

      const dfa = nfa.toDFA();

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

  describe("NFA class edge cases", () => {
    test("should handle empty NFA", () => {
      const emptyNFA = new NFA([], [], null, [], []);
      const emptyDFA = emptyNFA.toDFA();

      expect(emptyDFA.states).toHaveLength(0);
      expect(emptyDFA.transitions).toHaveLength(0);
      expect(emptyDFA.startState).toBeNull();
      expect(emptyDFA.acceptStates).toHaveLength(0);
    });

    test("should handle NFA with only start state and no transitions", () => {
      const startState: State = "q0";
      const nfa = new NFA([startState], [], startState, [], []);
      const dfa = nfa.toDFA();

      expect(dfa.states).toHaveLength(1);
      expect(dfa.states[0]).toBe(startState);
      expect(dfa.startState).toBe(startState);
      expect(dfa.transitions).toHaveLength(0);
    });

    test("should handle NFA with only epsilon transitions", () => {
      const states: State[] = ["q0", "q1", "q2"];
      const transitions: Transition[] = [
        { from: "q0", to: "q1", symbol: "ε" },
        { from: "q1", to: "q2", symbol: "ε" },
      ];
      const nfa = new NFA(states, transitions, "q0", ["q2"], []);
      const dfa = nfa.toDFA();

      expect(dfa.states).toHaveLength(1);
      expect(dfa.states[0]).toBe("q0,q1,q2");
      expect(dfa.startState).toBe("q0,q1,q2");
      expect(dfa.acceptStates).toEqual(["q0,q1,q2"]);
      expect(dfa.transitions).toHaveLength(0);
    });

    test("should handle NFA with epsilon loops", () => {
      const states: State[] = ["q0", "q1"];
      const transitions: Transition[] = [
        { from: "q0", to: "q1", symbol: "ε" },
        { from: "q1", to: "q0", symbol: "ε" },
      ];
      const nfa = new NFA(states, transitions, "q0", ["q1"], []);
      const dfa = nfa.toDFA();

      expect(dfa.states).toHaveLength(1);
      expect(dfa.states[0]).toBe("q0,q1");
      expect(dfa.startState).toBe("q0,q1");
      expect(dfa.acceptStates).toEqual(["q0,q1"]);
    });

    test("should handle NFA with no accept states", () => {
      const states: State[] = ["q0", "q1"];
      const transitions: Transition[] = [{ from: "q0", to: "q1", symbol: "a" }];
      const nfa = new NFA(states, transitions, "q0", [], ["a"]);
      const dfa = nfa.toDFA();

      expect(dfa.acceptStates).toHaveLength(0);
    });

    test("should handle NFA with all states as accept states", () => {
      const states: State[] = ["q0", "q1"];
      const transitions: Transition[] = [{ from: "q0", to: "q1", symbol: "a" }];
      const nfa = new NFA(states, transitions, "q0", states, ["a"]);
      const dfa = nfa.toDFA();

      expect(dfa.acceptStates.length).toBe(2);
    });

    test("should handle NFA with single symbol alphabet", () => {
      const states: State[] = ["q0", "q1"];
      const transitions: Transition[] = [{ from: "q0", to: "q1", symbol: "a" }];
      const nfa = new NFA(states, transitions, "q0", ["q1"], ["a"]);
      const dfa = nfa.toDFA();

      expect(dfa.alphabet).toEqual(["a"]);
      expect(dfa.transitions.every((t) => t.symbol === "a")).toBeTruthy();
    });

    test("should handle NFA with self-loops on all symbols", () => {
      const states: State[] = ["q0"];
      const transitions: Transition[] = [
        { from: "q0", to: "q0", symbol: "a" },
        { from: "q0", to: "q0", symbol: "b" },
      ];
      const nfa = new NFA(states, transitions, "q0", ["q0"], ["a", "b"]);
      const dfa = nfa.toDFA();

      expect(dfa.states).toHaveLength(1);
      expect(dfa.transitions).toHaveLength(2);
      expect(dfa.transitions.every((t) => t.from === t.to)).toBeTruthy();
    });

    test("should handle NFA with trap state", () => {
      const states: State[] = ["q0", "q1", "q2"];
      const transitions: Transition[] = [
        { from: "q0", to: "q1", symbol: "a" },
        { from: "q1", to: "q2", symbol: "b" },
        { from: "q2", to: "q2", symbol: "a" },
        { from: "q2", to: "q2", symbol: "b" },
      ];
      const nfa = new NFA(states, transitions, "q0", ["q1"], ["a", "b"]);
      const dfa = nfa.toDFA();

      expect(dfa.states).toContain("q2");
      expect(
        dfa.transitions.filter((t) => t.from === "q2" && t.to === "q2"),
      ).toHaveLength(2);
    });
  });
});
