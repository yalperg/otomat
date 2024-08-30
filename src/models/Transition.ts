import State from "./State";

/**
 * Represents a transition between two states in the automaton.
 * A transition occurs when a specific symbol is read, moving from one state to another.
 */
export default class Transition {
  /**
   * Creates a new transition.
   * @param from The state where the transition starts.
   * @param to The state where the transition ends.
   * @param symbol The symbol that triggers the transition.
   */
  constructor(
    public readonly from: State,
    public readonly to: State,
    public readonly symbol: string,
  ) {}
}
