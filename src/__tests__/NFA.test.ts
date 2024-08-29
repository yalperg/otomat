import NFA from "../NFA";
import State from "../State";
import Transition from "../Transition";
import Alphabet from "../Alphabet";

describe("NFA class", () => {
  describe("toDFA method", () => {
    test("should convert an NFA with a single state and no transitions to a DFA", () => {
      const stateA = new State("A");
      const nfa = new NFA([stateA], [], stateA, [stateA], new Alphabet([]));

      const dfa = nfa.toDFA(true);

      expect(dfa.states).toHaveLength(1);
      expect(dfa.states[0].name).toBe("A");
      expect(dfa.startState).toBe(dfa.states[0]);
      expect(dfa.acceptStates).toEqual(dfa.states);
      expect(dfa.transitions).toHaveLength(0);
    });

    test("should convert an NFA with epsilon transitions to a DFA", () => {
      const stateA = new State("A");
      const stateB = new State("B");
      const stateC = new State("C");

      const transitions = [
        new Transition(stateA, stateB, "ε"),
        new Transition(stateB, stateC, "ε"),
      ];

      const alphabet = new Alphabet(["ε"]);
      const nfa = new NFA(
        [stateA, stateB, stateC],
        transitions,
        stateA,
        [stateC],
        alphabet,
      );

      const dfa = nfa.toDFA(true);

      expect(dfa.states).toHaveLength(1);
      expect(dfa.states[0].name).toBe("A,B,C");
      expect(dfa.startState!.name).toBe("A,B,C");
      expect(dfa.acceptStates).toEqual(dfa.states);
      expect(dfa.transitions).toHaveLength(0);
    });

    test("should convert an NFA with multiple states and transitions to a DFA", () => {
      const stateA = new State("A");
      const stateB = new State("B");
      const stateC = new State("C");

      const transitions = [
        new Transition(stateA, stateB, "0"),
        new Transition(stateB, stateC, "1"),
        new Transition(stateC, stateA, "0"),
        new Transition(stateA, stateC, "1"),
        new Transition(stateB, stateA, "0"),
      ];

      const alphabet = new Alphabet(["0", "1"]);
      const nfa = new NFA(
        [stateA, stateB, stateC],
        transitions,
        stateA,
        [stateC],
        alphabet,
      );

      const dfa = nfa.toDFA(true);
      expect(dfa.states.length).toBeGreaterThan(0);
      expect(dfa.startState!.name).toBe("A");
      expect(
        dfa.acceptStates.some((state) => state.name.includes("C")),
      ).toBeTruthy();
      expect(dfa.transitions.length).toBeGreaterThan(0);
    });

    test("should remove unreachable states in DFA", () => {
      const stateA = new State("A");
      const stateB = new State("B");
      const stateC = new State("C");
      const stateD = new State("D");

      const transitions = [
        new Transition(stateA, stateB, "0"),
        new Transition(stateB, stateC, "1"),
        new Transition(stateC, stateA, "0"),
        new Transition(stateA, stateC, "1"),
        new Transition(stateB, stateA, "0"),
        new Transition(stateC, stateB, "1"),
        new Transition(stateD, stateD, "0"), // Unreachable state
        new Transition(stateD, stateD, "1"), // Unreachable state
      ];

      const alphabet = new Alphabet(["0", "1"]);
      const nfa = new NFA(
        [stateA, stateB, stateC, stateD],
        transitions,
        stateA,
        [stateC],
        alphabet,
      );

      const dfa = nfa.toDFA(true);

      expect(dfa.states).not.toContainEqual(
        expect.objectContaining({ name: "D" }),
      );
      expect(dfa.transitions).not.toContainEqual(
        expect.objectContaining({
          from: expect.objectContaining({ name: "D" }),
        }),
      );
    });
  });

  describe("epsilonClosure method", () => {
    test("should compute epsilon closure correctly", () => {
      const stateA = new State("A");
      const stateB = new State("B");
      const stateC = new State("C");

      const transitions = [
        new Transition(stateA, stateB, "ε"),
        new Transition(stateB, stateC, "ε"),
      ];

      const alphabet = new Alphabet(["ε"]);
      const nfa = new NFA(
        [stateA, stateB, stateC],
        transitions,
        stateA,
        [stateC],
        alphabet,
      );

      const closure = nfa["epsilonClosure"](stateA);
      expect(closure.size).toBe(3);
      expect(closure.has(stateA)).toBeTruthy();
      expect(closure.has(stateB)).toBeTruthy();
      expect(closure.has(stateC)).toBeTruthy();
    });
  });

  describe("move method", () => {
    test("should compute move correctly", () => {
      const stateA = new State("A");
      const stateB = new State("B");
      const stateC = new State("C");

      const transitions = [
        new Transition(stateA, stateB, "0"),
        new Transition(stateA, stateC, "1"),
        new Transition(stateB, stateC, "1"),
      ];

      const alphabet = new Alphabet(["0", "1"]);
      const nfa = new NFA(
        [stateA, stateB, stateC],
        transitions,
        stateA,
        [stateC],
        alphabet,
      );

      const moveResult = nfa["move"](new Set([stateA, stateB]), "1");
      expect(moveResult.size).toBe(1);
      expect(moveResult.has(stateC)).toBeTruthy();
    });
  });
});
