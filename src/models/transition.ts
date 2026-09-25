import Validator from '../utils/validator.js';
export { EPSILON, type TransitionData } from '../types/automaton.js';

/** An immutable transition record. */
export default class Transition {
  readonly from: string;
  readonly input: string;
  readonly to: readonly string[];

  private constructor(from: string, input: string, to: readonly string[]) {
    Validator.transitions([{ from, input, to }]);
    this.from = from;
    this.input = input;
    this.to = Object.freeze([...to]);
    Object.freeze(this);
  }

  static create(
    from: string,
    input: string,
    to: readonly string[],
  ): Transition {
    return new Transition(from, input, to);
  }

  isDeterministic(): boolean {
    return this.to.length === 1;
  }

  equals(other: Transition): boolean {
    return (
      this.from === other.from &&
      this.input === other.input &&
      this.to.length === other.to.length &&
      this.to.every((state) => other.to.includes(state))
    );
  }

  toString(): string {
    return `${this.from} --${this.input}--> [${this.to.join(', ')}]`;
  }
}
