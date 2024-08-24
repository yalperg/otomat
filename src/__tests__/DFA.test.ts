import DFA from "../DFA";
import State from "../State";
import Transition from "../Transition";
import Alphabet from "../Alphabet";
import ValidationError from "../ValidationError";

describe("Deterministic Finite Automaton (DFA)", () => {
  let alphabet: Alphabet;
  let q1: State;
  let q2: State;

  beforeEach(() => {
    alphabet = new Alphabet(["0", "1"]);
    q1 = new State("q1");
    q2 = new State("q2");
  });

  test("should add states correctly", () => {
    const dfa = new DFA([], [], null, [], alphabet);
    dfa.addState(q1);
    dfa.addState(q2);
    expect(dfa.states).toContain(q1);
    expect(dfa.states).toContain(q2);
  });

  test("should throw error when adding duplicate state", () => {
    const dfa = new DFA([q1], [], null, [], alphabet);
    expect(() => dfa.addState(q1)).toThrow(`State ${q1.name} already exists`);
  });

  test("should add transitions correctly", () => {
    const dfa = new DFA([q1, q2], [], null, [], alphabet);
    const transition = new Transition(q1, q2, "0");
    dfa.addTransition(transition);
    expect(dfa.transitions).toContain(transition);
  });

  test("should throw error when adding a transition with a symbol not in alphabet", () => {
    const dfa = new DFA([q1, q2], [], null, [], alphabet);
    const invalidTransition = new Transition(q1, q2, "2"); // '2' is not in the alphabet
    expect(() => dfa.addTransition(invalidTransition)).toThrow(
      `Symbol '2' in transition from ${q1.name} to ${q2.name} is not in the alphabet.`,
    );
  });

  test("should throw error when adding a transition with epsilon symbol", () => {
    const dfa = new DFA([q1, q2], [], null, [], alphabet);
    const epsilonTransition = new Transition(q1, q2, "ε");
    expect(() => dfa.addTransition(epsilonTransition)).toThrow(ValidationError);
  });

  test("should throw error when adding duplicate transition", () => {
    const dfa = new DFA([q1, q2], [], null, [], alphabet);
    const transition = new Transition(q1, q2, "0");
    dfa.addTransition(transition);
    expect(() => dfa.addTransition(transition)).toThrow(
      `Transition from ${q1.name} to ${q2.name} with symbol 0 already exists`,
    );
  });

  test("should set the start state correctly", () => {
    const dfa = new DFA([q1, q2], [], null, [], alphabet);
    dfa.setStartState(q1);
    expect(dfa.startState).toBe(q1);
  });

  test("should throw error when setting start state that does not exist", () => {
    const dfa = new DFA([], [], null, [], alphabet);
    expect(() => dfa.setStartState(q1)).toThrow(
      `State ${q1.name} does not exist`,
    );
  });

  test("should add accept states correctly", () => {
    const dfa = new DFA([q1, q2], [], null, [], alphabet);
    dfa.addAcceptState([q1]);
    expect(dfa.acceptStates).toContain(q1);
  });

  test("should throw error when adding an accept state that does not exist", () => {
    const dfa = new DFA([], [], null, [], alphabet);
    expect(() => dfa.addAcceptState([q1])).toThrow(
      `State ${q1.name} does not exist`,
    );
  });

  test("should serialize to JSON correctly", () => {
    const dfa = new DFA([q1, q2], [], q1, [q2], alphabet);
    const json = dfa.toJSON();
    expect(json).toEqual({
      states: ["q1", "q2"],
      transitions: [],
      startState: "q1",
      acceptStates: ["q2"],
      alphabet: ["0", "1"],
    });
  });

  test("should deserialize from JSON correctly", () => {
    const json = {
      states: ["q1", "q2"],
      transitions: [{ from: "q1", to: "q2", symbol: "0" }],
      startState: "q1",
      acceptStates: ["q2"],
      alphabet: ["0", "1"],
    };

    const dfa = DFA.fromJSON(json);

    const stateMap = new Map(dfa.states.map((s: State) => [s.name, s]));

    expect(stateMap.has("q1")).toBeTruthy();
    expect(stateMap.has("q2")).toBeTruthy();

    expect(dfa.startState?.name).toBe("q1");
    expect(dfa.acceptStates.map((s: State) => s.name)).toEqual(["q2"]);
    expect(dfa.alphabet.getSymbols()).toEqual(["0", "1"]);
    expect(dfa.transitions).toHaveLength(1);
    expect(dfa.transitions[0].from.name).toBe("q1");
    expect(dfa.transitions[0].to.name).toBe("q2");
    expect(dfa.transitions[0].symbol).toBe("0");
  });
});
