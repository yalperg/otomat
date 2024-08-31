export type State = string;

export type Transition = {
  from: State;
  to: State;
  symbol: string;
};

export type Alphabet = string[];

export type FSAJSON = {
  states: State[];
  transitions: Transition[];
  startState: State | null;
  acceptStates: State[];
  alphabet: Alphabet;
};

export interface IFSA {
  states: State[];
  transitions: Transition[];
  startState: State | null;
  acceptStates: State[];
  alphabet: Alphabet;

  addState(state: State): void;
  addTransition(transition: Transition): void;
  setStartState(state: State): void;
  addAcceptState(states: State[]): void;
  toJSON(): FSAJSON;
}
