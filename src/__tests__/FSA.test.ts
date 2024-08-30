import FSA from "../models/FSA";
import State from "../models/State";
import Transition from "../models/Transition";
import Alphabet from "../models/Alphabet";
import type { FSAJSON } from "../types";

describe("Finite State Automaton (FSA)", () => {
  let alphabet: Alphabet;
  let q1: State;
  let q2: State;

  beforeEach(() => {
    alphabet = new Alphabet(["0", "1", "ε"]);
    q1 = new State("q1");
    q2 = new State("q2");
  });

  test("should add states correctly", () => {
    const fsa = new FSA([], [], null, [], alphabet);
    fsa.addState(q1);
    fsa.addState(q2);
    expect(fsa.states).toContain(q1);
    expect(fsa.states).toContain(q2);
  });

  test("should throw error when adding duplicate state", () => {
    const fsa = new FSA([q1], [], null, [], alphabet);
    expect(() => fsa.addState(q1)).toThrow(`State ${q1.name} already exists`);
  });

  test("should add transitions correctly", () => {
    const fsa = new FSA([q1, q2], [], null, [], alphabet);
    const transition = new Transition(q1, q2, "0");
    fsa.addTransition(transition);
    expect(fsa.transitions).toContain(transition);
  });

  test("should throw error when adding a transition with a symbol not in alphabet", () => {
    const fsa = new FSA([q1, q2], [], null, [], alphabet);
    const invalidTransition = new Transition(q1, q2, "2"); // '2' is not in the alphabet
    expect(() => fsa.addTransition(invalidTransition)).toThrow(
      `Symbol '2' in transition from ${q1.name} to ${q2.name} is not in the alphabet.`,
    );
  });

  test("should set the start state correctly", () => {
    const fsa = new FSA([q1, q2], [], null, [], alphabet);
    fsa.setStartState(q1);
    expect(fsa.startState).toBe(q1);
  });

  test("should throw error when setting start state that does not exist", () => {
    const fsa = new FSA([], [], null, [], alphabet);
    expect(() => fsa.setStartState(q1)).toThrow(
      `State ${q1.name} does not exist`,
    );
  });

  test("should add accept states correctly", () => {
    const fsa = new FSA([q1, q2], [], null, [], alphabet);
    fsa.addAcceptState([q1]);
    expect(fsa.acceptStates).toContain(q1);
  });

  test("should throw error when adding an accept state that does not exist", () => {
    const fsa = new FSA([], [], null, [], alphabet);
    expect(() => fsa.addAcceptState([q1])).toThrow(
      `State ${q1.name} does not exist`,
    );
  });

  test("should serialize to JSON correctly", () => {
    const fsa = new FSA([q1, q2], [], q1, [q2], alphabet);
    const json = fsa.toJSON();
    expect(json).toEqual({
      states: ["q1", "q2"],
      transitions: [],
      startState: "q1",
      acceptStates: ["q2"],
      alphabet: ["0", "1", "ε"],
    });
  });

  test("should deserialize from JSON correctly", () => {
    const json: FSAJSON = {
      states: ["q1", "q2"],
      transitions: [{ from: "q1", to: "q2", symbol: "0" }],
      startState: "q1",
      acceptStates: ["q2"],
      alphabet: ["0", "1", "ε"],
    };

    const fsa = FSA.fromJSON(json);

    const stateMap = new Map(fsa.states.map((s: State) => [s.name, s]));

    expect(stateMap.has("q1")).toBeTruthy();
    expect(stateMap.has("q2")).toBeTruthy();

    expect(fsa.startState?.name).toBe("q1");
    expect(fsa.acceptStates.map((s: State) => s.name)).toEqual(["q2"]);
    expect(fsa.alphabet.getSymbols()).toEqual(["0", "1", "ε"]);
    expect(fsa.transitions).toHaveLength(1);
    expect(fsa.transitions[0].from.name).toBe("q1");
    expect(fsa.transitions[0].to.name).toBe("q2");
    expect(fsa.transitions[0].symbol).toBe("0");
  });
});
