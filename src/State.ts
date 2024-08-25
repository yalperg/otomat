/**
 * Represents a state in the finite state automaton.
 * A state has a name and can be linked to other states through transitions.
 */
export default class State {
  name: string;

  /**
   * Creates a new state.
   * @param name The name of the state.
   */
  constructor(name: string) {
    this.name = name;
  }
}
