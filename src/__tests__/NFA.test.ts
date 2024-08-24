import NFA from "../NFA";
import State from "../State";
import Transition from "../Transition";
import Alphabet from "../Alphabet";

describe("NFA toDFA method", () => {
  test("should convert an NFA with a single state and no transitions to a DFA", () => {
    const stateA = new State("A");
    const nfa = new NFA([stateA], [], stateA, [stateA], new Alphabet([]));

    const dfa = nfa.toDFA();

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

    const dfa = nfa.toDFA();

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

    const dfa = nfa.toDFA();
    expect(dfa.states).toHaveLength(4); // Number of DFA states will vary depending on the NFA
    expect(dfa.startState!.name).toBe("A");
    expect(dfa.acceptStates.map((state) => state.name)).toContain("C");
    expect(dfa.transitions).toHaveLength(8); // Adjust depending on the expected number of DFA transitions
  });

  test("should handle removing unreachable states in DFA", () => {
    const stateA = new State("A");
    const stateB = new State("B");
    const stateC = new State("C");

    const transitions = [
      new Transition(stateA, stateB, "0"),
      new Transition(stateB, stateC, "1"),
      new Transition(stateC, stateA, "0"),
      new Transition(stateA, stateC, "1"),
      new Transition(stateB, stateA, "0"),
      new Transition(stateC, stateB, "1"),
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

    expect(dfa.states).toHaveLength(3); // Should only include reachable states
    expect(dfa.startState!.name).toBe("A");
    expect(dfa.acceptStates.map((state) => state.name)).toContain("C");
    expect(dfa.transitions).toHaveLength(6); // Adjust depending on the expected number of DFA transitions
  });
});
