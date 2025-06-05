import Validator from '@/utils/validator';

export const EPSILON = 'ε';

export type TransitionData = {
  from: string;
  input: string;
  to: string[];
};

export default class Transition {
  public readonly from: string;
  public readonly input: string;
  public readonly to: string[];

  /**
   * Private constructor. Use Transition.create().
   * @param from Source state id
   * @param input Input symbol
   * @param to Array of destination state ids
   * @throws {InvalidAutomatonError} If arguments are invalid
   */
  private constructor(from: string, input: string, to: string[]) {
    Validator.transitions([{ from, input, to }]);

    this.from = from;
    this.input = input;
    this.to = [...to];
  }

  /**
   * Factory method to create a new Transition.
   * @param from Source state id
   * @param input Input symbol
   * @param to Array of destination state ids
   * @returns {Transition} The new Transition instance
   * @throws {InvalidAutomatonError} If arguments are invalid
   */
  static create(from: string, input: string, to: string[]): Transition {
    return new Transition(from, input, to);
  }

  /**
   * Whether this transition is deterministic (single destination).
   * @returns {boolean}
   */
  isDeterministic(): boolean {
    return this.to.length === 1;
  }

  /**
   * Check if this transition is equal to another.
   * @param other The other Transition
   * @returns {boolean} True if equal, false otherwise
   */
  equals(other: Transition): boolean {
    if (this.from !== other.from || this.input !== other.input) {
      return false;
    }

    if (this.to.length !== other.to.length) {
      return false;
    }

    return (
      this.to.every((state) => other.to.includes(state)) &&
      other.to.every((state) => this.to.includes(state))
    );
  }

  /**
   * String representation of the transition.
   * @returns {string} The transition in the format "from --input--> [to1, to2, ...]"
   */
  toString(): string {
    return `${this.from} --${this.input}--> [${this.to.join(', ')}]`;
  }
}
