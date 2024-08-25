import State from "./State";
import Transition from "./Transition";
import Alphabet from "./Alphabet";
import ValidationError from "./errors/ValidationError";

export interface FSAJSON {
  states: string[];
  transitions: { from: string; to: string; symbol: string }[];
  startState: string;
  acceptStates: string[];
  alphabet: string[];
}

/**
 * Represents a Finite State Automaton (FSA), which is the base class
 * for both deterministic (DFA) and nondeterministic (NFA) automata.
 * An FSA consists of a set of states, transitions, a start state,
 * a set of accept states, and an alphabet of symbols.
 */
export default class FSA {
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
      if (!alphabet.hasSymbol(transition.symbol) && transition.symbol !== "ε") {
        throw new ValidationError(
          `Symbol '${transition.symbol}' in transition from '${transition.from.name}' to '${transition.to.name}' is not in the alphabet.`,
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
      throw new Error(`State ${state.name} already exists`);
    }
    this.states.push(state);
  }

  /**
   * Adds a new transition between states.
   * @param transition The transition to add.
   * @throws Error If the transition uses an invalid symbol or already exists.
   */
  addTransition(transition: Transition) {
    if (!this.alphabet.hasSymbol(transition.symbol)) {
      throw new Error(
        `Symbol '${transition.symbol}' in transition from ${transition.from.name} to ${transition.to.name} is not in the alphabet.`,
      );
    }

    this.transitions.map((t) => {
      if (
        t.from === transition.from &&
        t.to === transition.to &&
        t.symbol === transition.symbol
      ) {
        throw new Error(
          `Transition from ${transition.from.name} to ${transition.to.name} with symbol ${transition.symbol} already exists`,
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
      throw new Error(`State ${state.name} does not exist`);
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
        throw new Error(`State ${state.name} does not exist`);
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
      states: this.states.map((state) => state.name),
      transitions: this.transitions.map((transition) => ({
        from: transition.from.name,
        to: transition.to.name,
        symbol: transition.symbol,
      })),
      startState: this.startState ? this.startState.name : "",
      acceptStates: this.acceptStates.map((state) => state.name),
      alphabet: this.alphabet.getSymbols(),
    };
  }

  /**
   * Creates an FSA from a JSON representation.
   * @param json The JSON representation of the FSA.
   * @returns A new FSA instance.
   */
  static fromJSON(json: FSAJSON): FSA {
    const states = json.states.map((name: string) => new State(name));
    const stateMap = new Map(states.map((state: State) => [state.name, state]));
    const transitions = json.transitions.map(
      (transition) =>
        new Transition(
          stateMap.get(transition.from)!,
          stateMap.get(transition.to)!,
          transition.symbol,
        ),
    );
    const startState = stateMap.get(json.startState) as State;
    const acceptStates = json.acceptStates.map(
      (name: string) => stateMap.get(name)!,
    );
    const alphabet = new Alphabet(json.alphabet);

    return new FSA(states, transitions, startState, acceptStates, alphabet);
  }
}
