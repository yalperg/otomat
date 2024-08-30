/**
 * Represents a state in the finite state automaton.
 * A state has a name and can be linked to other states through transitions.
 */
export default class State {
  /**
   * Creates a new state.
   * @param name The name of the state.
   */
  constructor(public readonly name: string) {}
}
