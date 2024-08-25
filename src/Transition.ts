import State from "./State";

/**
 * Represents a transition between two states in the automaton.
 * A transition occurs when a specific symbol is read, moving from one state to another.
 */
export default class Transition {
  from: State;
  to: State;
  symbol: string;

  /**
   * Creates a new transition.
   * @param from The state where the transition starts.
   * @param to The state where the transition ends.
   * @param symbol The symbol that triggers the transition.
   */
  constructor(from: State, to: State, symbol: string) {
    this.from = from;
    this.to = to;
    this.symbol = symbol;
  }
}
