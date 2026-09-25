import Validator from '../utils/validator.js';
import Transition from './transition.js';
import { EPSILON, type AutomatonConfig } from '../types/automaton.js';
import { InvalidAutomatonError } from '../errors/index.js';
export type { AutomatonConfig } from '../types/automaton.js';

/** Validated immutable model. Set getters and destination lookups return snapshots. */
export default class Automaton {
  readonly #states: Set<string>;
  readonly #alphabet: Set<string>;
  readonly #startStates: Set<string>;
  readonly #acceptStates: Set<string>;
  readonly #index = new Map<string, Map<string, readonly Transition[]>>();
  readonly transitions: readonly Transition[];

  constructor(config: AutomatonConfig) {
    Validator.validate(config);
    this.#states = new Set(config.states);
    this.#alphabet = new Set(config.alphabet);
    this.#startStates = new Set(config.startStates);
    this.#acceptStates = new Set(config.acceptStates);
    this.transitions = Object.freeze(
      config.transitions.map((t) => Transition.create(t.from, t.input, t.to)),
    );
    const index = new Map<string, Map<string, Transition[]>>();
    for (const t of this.transitions) {
      let symbols = index.get(t.from);
      if (!symbols) index.set(t.from, (symbols = new Map()));
      const records = symbols.get(t.input) ?? [];
      records.push(t);
      symbols.set(t.input, records);
    }
    for (const [state, symbols] of index) {
      this.#index.set(
        state,
        new Map(
          [...symbols].map(([symbol, records]) => [
            symbol,
            Object.freeze(records),
          ]),
        ),
      );
    }
    Object.freeze(this);
  }

  get states(): Set<string> {
    return new Set(this.#states);
  }
  get alphabet(): Set<string> {
    return new Set(this.#alphabet);
  }
  get startStates(): Set<string> {
    return new Set(this.#startStates);
  }
  get acceptStates(): Set<string> {
    return new Set(this.#acceptStates);
  }

  hasSymbol(symbol: string): boolean {
    return this.#alphabet.has(symbol);
  }
  isAcceptState(state: string): boolean {
    return this.#acceptStates.has(state);
  }

  /** Indexed immutable records; preserves separate branches for simulation traces. */
  getTransitionRecords(from: string, input: string): readonly Transition[] {
    return this.#index.get(from)?.get(input) ?? EMPTY_TRANSITIONS;
  }

  getTransitions(from: string, input: string): string[] {
    return [
      ...new Set(this.getTransitionRecords(from, input).flatMap((t) => t.to)),
    ];
  }

  /** Structural equality: order independent, but duplicate record counts are significant. */
  equals(other: Automaton): boolean {
    const keys = (automaton: Automaton) =>
      automaton.transitions
        .map((t) => JSON.stringify([t.from, t.input, [...t.to].sort()]))
        .sort();
    return (
      setsEqual(this.#states, other.#states) &&
      setsEqual(this.#alphabet, other.#alphabet) &&
      setsEqual(this.#startStates, other.#startStates) &&
      setsEqual(this.#acceptStates, other.#acceptStates) &&
      JSON.stringify(keys(this)) === JSON.stringify(keys(other))
    );
  }

  /** Partial DFA: missing transitions reject; duplicate identical edges are deterministic. */
  isDFA(): boolean {
    if (this.#startStates.size !== 1) return false;
    for (const [state, symbols] of this.#index) {
      for (const symbol of symbols.keys()) {
        if (symbol === EPSILON || this.getTransitions(state, symbol).length > 1)
          return false;
      }
    }
    return true;
  }

  /** Classification API: true only for automata that are not deterministic. */
  isNFA(): boolean {
    return !this.isDFA();
  }

  toJSON(): AutomatonConfig {
    return {
      states: [...this.#states],
      alphabet: [...this.#alphabet],
      startStates: [...this.#startStates],
      acceptStates: [...this.#acceptStates],
      transitions: this.transitions.map((t) => ({
        from: t.from,
        input: t.input,
        to: [...t.to],
      })),
    };
  }

  static fromJSON(value: unknown): Automaton {
    let config: unknown = value;
    if (typeof value === 'string') {
      try {
        config = JSON.parse(value);
      } catch (cause) {
        throw new InvalidAutomatonError(
          'Invalid automaton JSON.',
          cause instanceof Error ? cause : undefined,
        );
      }
    }
    Validator.validate(config);
    return new Automaton(config);
  }
}

const EMPTY_TRANSITIONS: readonly Transition[] = Object.freeze([]);

function setsEqual<T>(left: ReadonlySet<T>, right: ReadonlySet<T>): boolean {
  return left.size === right.size && [...left].every((item) => right.has(item));
}
