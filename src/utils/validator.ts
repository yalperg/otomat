import { InvalidAutomatonError } from '../errors/index.js';
import {
  EPSILON,
  type AutomatonConfig,
  type TransitionData,
} from '../types/automaton.js';

/** Runtime boundary shared by constructors and JSON parsing. */
export default class Validator {
  static validate(config: unknown): asserts config is AutomatonConfig {
    if (!config || typeof config !== 'object') {
      throw new InvalidAutomatonError('Invalid automaton configuration.');
    }
    const data = config as Record<string, unknown>;
    const states = this.strings(data.states, 'States', true, true);
    const alphabet = this.strings(data.alphabet, 'Alphabet', true, true);
    if (alphabet.includes(EPSILON)) {
      throw new InvalidAutomatonError(
        `Symbol '${EPSILON}' is reserved and cannot be in the alphabet.`,
      );
    }
    this.transitions(data.transitions);
    const stateSet = new Set(states);
    const alphabetSet = new Set(alphabet);
    for (const t of data.transitions) {
      this.references([t.from, ...t.to], stateSet, 'Transition');
      if (t.input !== EPSILON && !alphabetSet.has(t.input)) {
        throw new InvalidAutomatonError(
          `Transition input '${t.input}' not in alphabet (except epsilon).`,
        );
      }
    }
    const starts = this.strings(data.startStates, 'Start states', true);
    const accepts = this.strings(data.acceptStates, 'Accept states');
    this.references(starts, stateSet, 'Start state');
    this.references(accepts, stateSet, 'Accept state');
  }

  static transitions(
    value: unknown,
  ): asserts value is readonly TransitionData[] {
    if (!Array.isArray(value)) {
      throw new InvalidAutomatonError('Transitions must be an array.');
    }
    for (const item of value) {
      if (!item || typeof item !== 'object') {
        throw new InvalidAutomatonError('Invalid transition structure.');
      }
      const t = item as Record<string, unknown>;
      if (!this.nonemptyString(t.from) || !this.nonemptyString(t.input)) {
        throw new InvalidAutomatonError(
          'Transition source and input must be non-empty strings.',
        );
      }
      this.strings(t.to, 'Transition destinations', true, true);
    }
  }

  private static nonemptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
  }

  private static strings(
    value: unknown,
    label: string,
    nonempty = false,
    unique = false,
  ): string[] {
    if (!Array.isArray(value) || (nonempty && value.length === 0)) {
      throw new InvalidAutomatonError(
        `${label} must be ${nonempty ? 'a non-empty' : 'an'} array.`,
      );
    }
    // Array.from also exposes sparse entries, which Array.every would skip.
    const items: unknown[] = Array.from(value);
    if (!items.every(this.nonemptyString)) {
      throw new InvalidAutomatonError(
        `${label} must contain non-empty strings.`,
      );
    }
    if (unique && new Set(items).size !== items.length) {
      throw new InvalidAutomatonError(`${label} must not contain duplicates.`);
    }
    return items;
  }

  private static references(
    values: readonly string[],
    states: ReadonlySet<string>,
    label: string,
  ): void {
    for (const state of values) {
      if (!states.has(state)) {
        throw new InvalidAutomatonError(
          `${label} references unknown state '${state}'.`,
        );
      }
    }
  }
}
