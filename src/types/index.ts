export interface FSAJSON {
  states: string[];
  transitions: { from: string; to: string; symbol: string }[];
  startState: string;
  acceptStates: string[];
  alphabet: string[];
}
