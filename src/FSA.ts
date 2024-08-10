import State from "./State";
import Transition from "./Transition";
import Alphabet from "./Alphabet";

export interface FSAJSON {
  states: string[];
  transitions: { from: string; to: string; symbol: string }[];
  startState: string;
  acceptStates: string[];
  alphabet: string[];
}

export default class FSA {
  states: State[];
  transitions: Transition[];
  startState: State | null;
  acceptStates: State[];
  alphabet: Alphabet;

  constructor(
    states: State[],
    transitions: Transition[],
    startState: State | null,
    acceptStates: State[],
    alphabet: Alphabet,
  ) {
    this.validateTransitions();

    this.states = states;
    this.transitions = transitions;
    this.startState = startState;
    this.acceptStates = acceptStates;
    this.alphabet = alphabet;
  }

  private validateTransitions() {
    this.transitions.forEach((transition) => {
      if (
        !this.alphabet.hasSymbol(transition.symbol) &&
        transition.symbol !== "ε"
      ) {
        throw new Error(
          `Symbol '${transition.symbol}' in transition from ${transition.from.name} to ${transition.to.name} is not in the alphabet.`,
        );
      }
    });
  }

  addState(state: State) {
    // TODO: Check if state already exists
    this.states.push(state);
  }

  addTransition(transition: Transition) {
    // TODO: Check if transition already exists (same from, to, and symbol) and transition is valid
    this.transitions.push(transition);
  }

  setStartState(state: State) {
    // TODO: Check if state is in states
    this.startState = state;
  }

  addAcceptState(state: State) {
    // TODO: Check if state is in states
    this.acceptStates.push(state);
  }

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
