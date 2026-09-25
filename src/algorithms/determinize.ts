import type Automaton from '../models/automaton.js';
import Transition from '../models/transition.js';
import type {
  NFAToDFAConversionStep,
  SubsetState,
} from '../types/conversion.js';
import { advance, epsilonClosure, subsetKey } from './operations.js';

/** One breadth-first traversal serves both direct and traced conversion. */
export function determinize(
  nfa: Automaton,
  onStep?: (step: NFAToDFAConversionStep) => void,
) {
  const start = epsilonClosure(nfa, nfa.startStates);
  const startName = subsetKey(start);
  const subsets = new Map<string, SubsetState>([[startName, start]]);
  const queue = [start];
  const transitions: Transition[] = [];
  const alphabet = nfa.alphabet;
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    const from = subsetKey(current);
    for (const symbol of alphabet) {
      const next = advance(nfa, current, symbol);
      const key = subsetKey(next);
      const isNew = next.size > 0 && !subsets.has(key);
      if (next.size > 0) {
        if (isNew) {
          subsets.set(key, next);
          queue.push(next);
        }
        transitions.push(Transition.create(from, symbol, [key]));
      }
      onStep?.({
        currentSubset: from,
        symbol,
        nextSubset: next.size ? key : undefined,
        isNewSubset: isNew,
        transitions: next.size ? [{ from, input: symbol, to: key }] : [],
      });
    }
  }
  return { startName, subsets, transitions };
}
