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

  isDFA(): boolean {
    if (this.startStates.size !== 1) return false;
    for (const t of this.transitions) {
      if (t.input === EPSILON) return false;
      if (!t.isDeterministic()) return false;
    }
    return true;
  }

  isNFA(): boolean {
    return !this.isDFA();
  }
}
