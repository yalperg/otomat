import { ConversionError } from './errors/index.js';
import Automaton from './models/automaton.js';
import { determinize } from './algorithms/determinize.js';
import type {
  NFAToDFAConvertOptions,
  NFAToDFAConversionStep,
  NFAToDFATrace,
  NFAToDFAResult,
} from './types/conversion.js';
export type {
  NFAToDFAConvertOptions,
  NFAToDFAConversionStep,
  NFAToDFATrace,
  NFAToDFAResult,
  SubsetState,
} from './types/conversion.js';

/** Subset construction producing an equivalent partial DFA. */
export default class NFAToDFAConverter {
  static convert(nfa: Automaton, options: { stepByStep: true }): NFAToDFATrace;
  static convert(nfa: Automaton, options?: { stepByStep?: false }): Automaton;
  static convert(
    nfa: Automaton,
    options?: NFAToDFAConvertOptions,
  ): NFAToDFAResult;
  static convert(
    nfa: Automaton,
    options?: NFAToDFAConvertOptions,
  ): NFAToDFAResult {
    if (!nfa.isNFA()) {
      throw new ConversionError('Input automaton is not an NFA.');
    }

    const steps: NFAToDFAConversionStep[] = [];
    const { startName, subsets, transitions } = determinize(
      nfa,
      options?.stepByStep ? (step) => steps.push(step) : undefined,
    );

    const dfa = new Automaton({
      states: [...subsets.keys()],
      alphabet: [...nfa.alphabet],
      transitions,
      startStates: [startName],
      acceptStates: [...subsets]
        .filter(([, subset]) =>
          [...subset].some((state) => nfa.isAcceptState(state)),
        )
        .map(([name]) => name),
    });

    return options?.stepByStep ? { dfa, steps } : dfa;
  }
}
