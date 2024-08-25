import Alphabet from "./Alphabet";
import FSA, { FSAJSON } from "./FSA";
import State from "./State";
import Transition from "./Transition";
import ValidationError from "./ValidationError";

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

    try {
      this.validateDFA();
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`DFA Validation Error: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  private validateDFA() {
    const transitionMap = new Map<string, State>();

    this.transitions.forEach((transition) => {
      if (transition.symbol === "ε") {
        throw new ValidationError("DFA cannot have epsilon transitions.");
      }

      const key = `${transition.from.name}-${transition.symbol}`;
      if (transitionMap.has(key)) {
        throw new ValidationError(
          `DFA cannot have multiple transitions from state '${transition.from.name}' with symbol '${transition.symbol}'.`,
        );
      }
      transitionMap.set(key, transition.to);
    });
  }

  addTransition(transition: Transition) {
    if (transition.symbol === "ε") {
      throw new ValidationError("DFA cannot have epsilon transitions.");
    }
    super.addTransition(transition);
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
