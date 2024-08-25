import Alphabet from "./Alphabet";
import FSA, { FSAJSON } from "./FSA";
import State from "./State";
import Transition from "./Transition";
import ValidationError from "./errors/ValidationError";

/**
 * Represents a Deterministic Finite Automaton (DFA).
 * A DFA is a specific type of FSA where for each state and symbol,
 * there is exactly one transition to a next state.
 */
export default class DFA extends FSA {
  emptyState: State;

  /**
   * Creates a new DFA.
   * @param states The set of states in the automaton.
   * @param transitions The set of transitions between states.
   * @param startState The initial state of the automaton.
   * @param acceptStates The set of accept states.
   * @param alphabet The alphabet of symbols used in transitions.
   */
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
        throw error; // Unexpected errors are rethrown
      }
    }
  }

  /**
   * Validates that the DFA conforms to the rules of determinism.
   * Ensures there are no epsilon transitions and no duplicate transitions for the same symbol.
   * @throws ValidationError If the DFA is invalid.
   */
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

  /**
   * Adds a new transition between states in the DFA.
   * Ensures that the transition conforms to DFA rules.
   * @param transition The transition to add.
   * @throws ValidationError If the transition uses an epsilon symbol.
   */
  addTransition(transition: Transition) {
    if (transition.symbol === "ε") {
      throw new ValidationError("DFA cannot have epsilon transitions.");
    }
    super.addTransition(transition);
  }

  /**
   * Creates a DFA from a JSON representation.
   * @param json The JSON representation of the DFA.
   * @returns A new DFA instance.
   */
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
