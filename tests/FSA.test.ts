import FSA from "../src/lib/FSA";
import { ValidationError } from "../src/errors";
import { State, Transition, Alphabet, FSAJSON } from "../src/types";

describe("FSA class", () => {
  const alphabet: Alphabet = ["a", "b"];
  const stateA: State = "q0";
  const stateB: State = "q1";

  describe("constructor", () => {
    test("should create a valid FSA", () => {
      const fsa = new FSA([stateA, stateB], [], stateA, [stateB], alphabet);
      expect(fsa.states).toHaveLength(2);
      expect(fsa.startState).toBe(stateA);
      expect(fsa.acceptStates).toContain(stateB);
    });
  });

  describe("addState method", () => {
    test("should add a new state", () => {
      const fsa = new FSA([stateA], [], stateA, [], alphabet);
      fsa.addState(stateB);
      expect(fsa.states).toContain(stateB);
    });

    test("should throw error for duplicate state", () => {
      const fsa = new FSA([stateA], [], stateA, [], alphabet);
      expect(() => fsa.addState(stateA)).toThrow(ValidationError);
    });
  });

  describe("addTransition method", () => {
    test("should add a valid transition", () => {
      const fsa = new FSA([stateA, stateB], [], stateA, [stateB], alphabet);
      const transition: Transition = { from: stateA, to: stateB, symbol: "a" };
      fsa.addTransition(transition);
      expect(fsa.transitions).toContain(transition);
    });

    test("should throw error for invalid transition symbol", () => {
      const fsa = new FSA([stateA, stateB], [], stateA, [stateB], alphabet);
      const invalidTransition: Transition = {
        from: stateA,
        to: stateB,
        symbol: "c",
      };
      expect(() => fsa.addTransition(invalidTransition)).toThrow(
        ValidationError,
      );
    });
  });

  describe("setStartState method", () => {
    test("should set start state", () => {
      const fsa = new FSA([stateA, stateB], [], null, [], alphabet);
      fsa.setStartState(stateA);
      expect(fsa.startState).toBe(stateA);
    });

    test("should throw error for non-existent state", () => {
      const fsa = new FSA([stateA], [], stateA, [], alphabet);
      expect(() => fsa.setStartState(stateB)).toThrow(ValidationError);
    });
  });

  describe("toJSON method", () => {
    test("should convert FSA to JSON", () => {
      const fsa = new FSA([stateA, stateB], [], stateA, [stateB], alphabet);
      const json = fsa.toJSON();
      expect(json.states).toEqual([stateA, stateB]);
      expect(json.startState).toBe(stateA);
      expect(json.acceptStates).toEqual([stateB]);
      expect(json.alphabet).toEqual(alphabet);
    });
  });

  describe("fromJSON method", () => {
    test("should create an FSA from valid JSON", () => {
      const json: FSAJSON = {
        states: [stateA, stateB],
        transitions: [{ from: stateA, to: stateB, symbol: "a" }],
        startState: stateA,
        acceptStates: [stateB],
        alphabet: alphabet,
      };

      const fsa = FSA.fromJSON(json);
      expect(fsa.states).toHaveLength(2);
      expect(fsa.startState).toBe(stateA);
      expect(fsa.acceptStates).toContain(stateB);
    });
  });
});
