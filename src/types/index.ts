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
