import State from "../models/State";
import Transition from "../models/Transition";
import Alphabet from "../models/Alphabet";
import { FSAJSON } from "../models/FSA";

export interface IFiniteStateAutomaton {
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
