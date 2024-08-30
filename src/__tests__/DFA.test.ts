import DFA from "../models/DFA";
import { ValidationError } from "../errors";
import { Alphabet, State, Transition, FSAJSON } from "../types";

describe("DFA class", () => {
  const alphabet: Alphabet = ["a", "b"];
  const stateA: State = "q0";
  const stateB: State = "q1";

  describe("constructor", () => {
    test("should create a valid DFA", () => {
      const dfa = new DFA([stateA, stateB], [], stateA, [stateB], alphabet);
      expect(dfa.states).toHaveLength(2);
      expect(dfa.startState).toBe(stateA);
      expect(dfa.acceptStates).toContain(stateB);
    });

    test("should throw error for epsilon transitions", () => {
      expect(() => {
        new DFA(
          [stateA, stateB],
          [{ from: stateA, to: stateB, symbol: "ε" }],
          stateA,
          [stateB],
          alphabet,
        );
      }).toThrow(ValidationError);
    });
  });

  describe("addTransition method", () => {
    test("should add a valid transition", () => {
      const dfa = new DFA([stateA, stateB], [], stateA, [stateB], alphabet);
      const transition: Transition = { from: stateA, to: stateB, symbol: "a" };
      dfa.addTransition(transition);
      expect(dfa.transitions).toContain(transition);
    });

    test("should throw error for duplicate transitions", () => {
      const dfa = new DFA(
        [stateA, stateB],
        [{ from: stateA, to: stateB, symbol: "a" }],
        stateA,
        [stateB],
        alphabet,
      );
      const duplicateTransition: Transition = {
        from: stateA,
        to: stateB,
        symbol: "a",
      };
      expect(() => dfa.addTransition(duplicateTransition)).toThrow(
        ValidationError,
      );
    });
  });

  describe("fromJSON method", () => {
    test("should create a DFA from valid JSON", () => {
      const json: FSAJSON = {
        states: [stateA, stateB],
        transitions: [{ from: stateA, to: stateB, symbol: "a" }],
        startState: stateA,
        acceptStates: [stateB],
        alphabet: alphabet,
      };

      const dfa = DFA.fromJSON(json);
      expect(dfa.states).toHaveLength(2);
      expect(dfa.startState).toBe(stateA);
      expect(dfa.acceptStates).toContain(stateB);
    });
  });
});
