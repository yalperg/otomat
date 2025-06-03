import Validator from '@/utils/validator';
import Transition, { EPSILON, TransitionData } from './transition';

export type AutomatonConfig = {
  states: string[];
  alphabet: string[];
  transitions: (TransitionData | Transition)[];
  startStates: string[];
  acceptStates: string[];
};

export default class Automaton {
  public readonly states: Set<string>;
  public readonly alphabet: Set<string>;
  public readonly transitions: Transition[];
  public readonly startStates: Set<string>;
  public readonly acceptStates: Set<string>;

  constructor(config: AutomatonConfig) {
    Validator.validate(config);

    this.states = new Set(config.states);
    this.alphabet = new Set(config.alphabet);
    this.transitions = config.transitions.map((t) => {
      return t instanceof Transition
        ? t
        : Transition.create(t.from, t.input, t.to);
    });
    this.startStates = new Set(config.startStates);
    this.acceptStates = new Set(config.acceptStates);
  }

  /**
   * Check if this automaton is equal to another.
   * Two automatons are equal if they have the same states, alphabet, start states,
   * accept states, and transitions.
   * @param {Automaton} other The other automaton to compare with
   * @returns {boolean} True if equal, false otherwise
   * @throws {InvalidAutomatonError} If the automaton is not valid
   */
  equals(other: Automaton): boolean {
    return (
      this.setsEqual(this.states, other.states) &&
      this.setsEqual(this.alphabet, other.alphabet) &&
      this.setsEqual(this.startStates, other.startStates) &&
      this.setsEqual(this.acceptStates, other.acceptStates) &&
      this.transitions.length === other.transitions.length &&
      this.transitions.every((t, i) => {
        return other.transitions[i] && t.equals(other.transitions[i]);
      })
    );
  }

  /**
   * Check if this automaton is a Deterministic Finite Automaton (DFA).
   * A DFA has exactly one start state, no epsilon transitions, and each transition
   * has a single destination state.
   * @returns {boolean} True if this automaton is a DFA, false otherwise
   * @throws {InvalidAutomatonError} If the automaton is not valid
   */
  isDFA(): boolean {
    if (this.startStates.size !== 1) return false;
    for (const t of this.transitions) {
      if (t.input === EPSILON) return false;
      if (!t.isDeterministic()) return false;
    }
    return true;
  }

  /**
   * Check if this automaton is a Non-deterministic Finite Automaton (NFA).
   * An NFA can have multiple start states, epsilon transitions, and transitions
   * with multiple destination states.
   * @returns {boolean} True if this automaton is an NFA, false otherwise
   */
  isNFA(): boolean {
    return !this.isDFA();
  }

  /**
   * Chgeck if two sets are equal.
   * Two sets are equal if they have the same size and contain the same elements.
   * @param a First set
   * @param b Second set
   * @returns {boolean} True if the sets are equal, false otherwise
   */
  private setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
}
