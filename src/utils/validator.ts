import { InvalidAutomatonError } from '@/errors';
import { AutomatonConfig } from '@/models/automaton';
import Transition, { EPSILON, TransitionData } from '@/models/transition';

export default class Validator {
  /**
   * Validate an automaton configuration.
   * @param config The automaton configuration to validate.
   * @throws {InvalidAutomatonError} If the configuration is invalid.
   */
  public static validate(config: AutomatonConfig): void {
    if (!config || typeof config !== 'object') {
      throw new InvalidAutomatonError('Invalid automaton configuration.');
    }

    const { states, alphabet, transitions, startStates, acceptStates } = config;

    this.states(states);
    this.alphabet(alphabet);
    this.transitions(transitions);
    this.stateReferences(states, transitions);
    this.startAndAcceptStates(states, startStates, acceptStates);
    this.validateTransitionSymbols(alphabet, transitions);
  }

  /**
   * Validate a set of states.
   * @param states The states to validate.
   * @throws {InvalidAutomatonError} If the states are invalid.
   */
  private static states(states: string[]): void {
    if (!Array.isArray(states) || states.length === 0) {
      throw new InvalidAutomatonError('States must be a non-empty array.');
    }
    const seen = new Set<string>();
    for (const state of states) {
      if (typeof state !== 'string' || state.length === 0) {
        throw new InvalidAutomatonError('States must be non-empty strings.');
      }
      if (seen.has(state)) {
        throw new InvalidAutomatonError(`Duplicate state '${state}' found.`);
      }
      seen.add(state);
    }
  }

  /**
   * Validate an alphabet array.
   * @param alphabet The alphabet array to validate.
   * @throws {InvalidAutomatonError} If the alphabet is invalid.
   */
  private static alphabet(alphabet: string[]): void {
    if (!Array.isArray(alphabet) || alphabet.length === 0) {
      throw new InvalidAutomatonError('Alphabet must be a non-empty array.');
    }
    const seen = new Set<string>();
    for (const symbol of alphabet) {
      if (typeof symbol !== 'string' || symbol.length === 0) {
        throw new InvalidAutomatonError(
          'Alphabet symbols must be non-empty strings.',
        );
      }
      if (seen.has(symbol)) {
        throw new InvalidAutomatonError(
          `Duplicate symbol '${symbol}' in alphabet.`,
        );
      }
      seen.add(symbol);
    }
  }

  /**
   * Validate an array of transitions.
   * @param transitions The transitions to validate.
   * @throws {InvalidAutomatonError} If any transition is invalid.
   */
  public static transitions(
    transitions: Array<{ from: string; input: string; to: string[] }>,
  ): void {
    if (!Array.isArray(transitions)) {
      throw new InvalidAutomatonError('Transitions must be an array.');
    }
    for (const t of transitions) {
      if (!this.isTransition(t)) {
        throw new InvalidAutomatonError('Invalid transition structure.');
      }
    }
  }

  /**
   * Validate that all transition state references exist in the states array.
   * @param states Array of valid state ids.
   * @param transitions Array of transitions to check.
   * @throws {InvalidAutomatonError} If any reference is invalid.
   */
  private static stateReferences(
    states: string[],
    transitions: Array<{ from: string; input: string; to: string[] }>,
  ): void {
    const stateSet = new Set(states);
    for (const t of transitions) {
      if (!this.isTransition(t)) {
        throw new InvalidAutomatonError('Invalid transition structure.');
      }
      if (!stateSet.has(t.from)) {
        throw new InvalidAutomatonError(
          `Transition from unknown state '${t.from}'.`,
        );
      }
      for (const dest of t.to) {
        if (!stateSet.has(dest)) {
          throw new InvalidAutomatonError(
            `Transition to unknown state '${dest}'.`,
          );
        }
      }
    }
  }

  /**
   * Validate that the start and accept states are valid.
   * @param startStates The start states to validate.
   * @param acceptStates The accept states to validate.
   * @throws {InvalidAutomatonError} If any state is invalid.
   */
  private static startAndAcceptStates(
    states: string[],
    startStates: string[],
    acceptStates: string[],
  ): void {
    if (!Array.isArray(startStates) || startStates.length === 0) {
      throw new InvalidAutomatonError(
        'Start states must be a non-empty array.',
      );
    }
    if (!Array.isArray(acceptStates)) {
      throw new InvalidAutomatonError('Accept states must be an array.');
    }

    const stateSet = new Set(states);
    // Check start states
    for (const s of startStates) {
      if (typeof s !== 'string' || s.length === 0) {
        throw new InvalidAutomatonError(
          'Start states must be non-empty strings.',
        );
      }
      if (!stateSet.has(s)) {
        throw new InvalidAutomatonError(`Start state '${s}' not in states.`);
      }
    }
    // Check accept states
    for (const s of acceptStates) {
      if (typeof s !== 'string' || s.length === 0) {
        throw new InvalidAutomatonError(
          'Accept states must be non-empty strings.',
        );
      }
      if (!stateSet.has(s)) {
        throw new InvalidAutomatonError(`Accept state '${s}' not in states.`);
      }
    }
  }

  /**
   * Validate transition symbols in the alphabet, excluding epsilon.
   * @param alphabet The alphabet to validate.
   * @param transitions The transitions to check.
   * @throws {InvalidAutomatonError} If any transition symbol is not in the alphabet.
   */
  private static validateTransitionSymbols(
    alphabet: string[],
    transitions: (TransitionData | Transition)[],
  ): void {
    for (const t of transitions) {
      if (t.input !== EPSILON && !alphabet.includes(t.input)) {
        throw new InvalidAutomatonError(
          `Transition input '${t.input}' not in alphabet (except epsilon).`,
        );
      }
    }
  }

  /**
   * Check if an object is a valid Transition.
   * @param t The object to check.
   * @returns {boolean} True if t is a Transition.
   */
  private static isTransition(t: unknown): t is TransitionData {
    // TODO: Implement a more robust type guard, WFT is this doing?
    if (
      typeof t !== 'object' ||
      t === null ||
      !('from' in t) ||
      !('input' in t) ||
      !('to' in t)
    ) {
      return false;
    }
    if (
      typeof t.from !== 'string' ||
      t.from.length === 0 ||
      typeof t.input !== 'string' ||
      !Array.isArray(t.to) ||
      t.to.length === 0 ||
      !t.to.every(
        (dest: unknown) => typeof dest === 'string' && dest.length > 0,
      )
    ) {
      return false;
    }
    const seen = new Set<string>();
    for (const dest of t.to) {
      if (seen.has(dest)) {
        return false;
      }
      seen.add(dest);
    }
    return true;
  }
}
