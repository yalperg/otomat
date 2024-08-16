import Alphabet from "./Alphabet";
import FSA, { FSAJSON } from "./FSA";
import State from "./State";
import Transition from "./Transition";

export default class DFA extends FSA {
  emptyState: State;

  constructor(
    states: State[],
    transitions: Transition[],
    startState: State | null,
    acceptStates: State[],
    alphabet: Alphabet,
  ) {
    super(states, transitions, startState, acceptStates, alphabet);
    this.emptyState = new State("∅");
    this.validateDFA();
  }

  addTransition(transition: Transition) {
    if (transition.symbol === "ε") {
      throw new Error("DFA cannot have epsilon transitions.");
    }
    super.addTransition(transition);
  }

  private validateDFA() {
    const transitionMap = new Map<string, State>();

    this.transitions.forEach((transition) => {
      if (transition.symbol === "ε") {
        throw new Error("DFA cannot have epsilon transitions.");
      }

      const key = `${transition.from.name}-${transition.symbol}`;
      if (transitionMap.has(key)) {
        throw new Error(
          `DFA cannot have multiple transitions for the same state and symbol: ${key}`,
        );
      }
      transitionMap.set(key, transition.to);
    });
  }

  static fromJSON(json: FSAJSON): DFA {
    const fsa = FSA.fromJSON(json);
    return new DFA(
      fsa.states,
      fsa.transitions,
      fsa.startState,
      fsa.acceptStates,
      fsa.alphabet,
    );
  }
}
