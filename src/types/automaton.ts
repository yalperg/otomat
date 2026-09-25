/** JSON-compatible definition. Inputs are copied when constructing an automaton. */
export interface TransitionData {
  readonly from: string;
  readonly input: string;
  readonly to: readonly string[];
}

export interface AutomatonConfig {
  readonly states: readonly string[];
  readonly alphabet: readonly string[];
  readonly transitions: readonly TransitionData[];
  readonly startStates: readonly string[];
  readonly acceptStates: readonly string[];
}

export const EPSILON = 'ε';
