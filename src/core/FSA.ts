import { ValidationError } from "../utils";
import { Alphabet, FSAJSON, State, Transition, IFSA } from "../types";
import { hasSymbol } from "../utils";
import { EPSILON_SYMBOL } from "../constants";

/**
 * Represents a Finite State Automaton (FSA), which is the base class
 * for both deterministic (DFA) and nondeterministic (NFA) automata.
 * An FSA consists of a set of states, transitions, a start state,
 * a set of accept states, and an alphabet of symbols.
 */
export default class FSA implements IFSA {
  states: State[];
  transitions: Transition[];
  startState: State | null;
  acceptStates: State[];
  alphabet: Alphabet;

  /**
   * Creates a new FSA.
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
    try {
      this.validateTransitions(transitions, alphabet);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`FSA Validation Error: ${error.message}`);
      } else {
        throw error;
      }
    }

    this.states = states;
    this.transitions = transitions;
    this.startState = startState;
    this.acceptStates = acceptStates;
    this.alphabet = alphabet;
  }

  /**
   * Validates that all transitions use symbols that are part of the alphabet.
   * @param transitions The set of transitions to validate.
   * @param alphabet The alphabet to validate against.
   * @throws ValidationError If a transition uses an invalid symbol.
   */
  private validateTransitions(transitions: Transition[], alphabet: Alphabet) {
    transitions.forEach((transition) => {
      if (
        !hasSymbol(alphabet, transition.symbol) &&
        transition.symbol !== EPSILON_SYMBOL
      ) {
        throw new ValidationError(
          `Symbol '${transition.symbol}' is not in the alphabet.`,
        );
      }
    });
  }

  /**
   * Adds a new state to the automaton.
   * @param state The state to add.
   * @throws Error If the state already exists.
   */
  addState(state: State) {
    if (this.states.includes(state)) {
      throw new ValidationError(`State ${state} already exists`); // Değişiklik yapıldı
    }
    this.states.push(state);
  }

  /**
   * Adds a new transition between states.
   * @param transition The transition to add.
   * @throws Error If the transition uses an invalid symbol or already exists.
   */
  addTransition(transition: Transition) {
    if (
      !hasSymbol(this.alphabet, transition.symbol) &&
      transition.symbol !== EPSILON_SYMBOL
    ) {
      throw new ValidationError(
        `Symbol '${transition.symbol}' is not in the alphabet.`,
      );
    }

    this.transitions.map((t) => {
      if (
        t.from === transition.from &&
        t.to === transition.to &&
        t.symbol === transition.symbol
      ) {
        throw new ValidationError(
          `Transition from ${transition.from} to ${transition.to} with symbol ${transition.symbol} already exists`,
        );
      }
    });

    this.transitions.push(transition);
  }

  /**
   * Sets the start state of the automaton.
   * @param state The state to set as the start state.
   * @throws Error If the state does not exist in the automaton.
   */
  setStartState(state: State) {
    if (!this.states.includes(state)) {
      throw new ValidationError(`State ${state} does not exist`); // Değişiklik yapıldı
    }

    this.startState = state;
  }

  /**
   * Adds one or more states to the set of accept states.
   * @param states The states to add as accept states.
   * @throws Error If any of the states do not exist in the automaton.
   */
  addAcceptState(states: State[]) {
    states.forEach((state) => {
      if (!this.states.includes(state)) {
        throw new ValidationError(`State ${state} does not exist`);
      }
    });
    this.acceptStates.push(...states);
  }

  /**
   * Converts the FSA to a JSON representation.
   * @returns The JSON representation of the FSA.
   */
  toJSON(): FSAJSON {
    return {
      states: this.states,
      transitions: this.transitions,
      startState: this.startState,
      acceptStates: this.acceptStates,
      alphabet: this.alphabet,
    };
  }

  /**
   * Creates an FSA from a JSON representation.
   * @param json The JSON representation of the FSA.
   * @returns A new FSA instance.
   */
  static fromJSON(json: FSAJSON): FSA {
    return new FSA(
      json.states,
      json.transitions,
      json.startState,
      json.acceptStates,
      json.alphabet,
    );
  }
}
