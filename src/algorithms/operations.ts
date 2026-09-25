import type Automaton from '../models/automaton.js';
import { EPSILON } from '../types/automaton.js';

/** Iterative closure with indexed epsilon edges; terminates even on epsilon cycles. */
export function epsilonClosure(
  automaton: Automaton,
  states: Iterable<string>,
): Set<string> {
  const closure = new Set(states);
  const queue = [...closure];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    for (const transition of automaton.getTransitionRecords(
      queue[cursor],
      EPSILON,
    )) {
      for (const target of transition.to) {
        if (!closure.has(target)) {
          closure.add(target);
          queue.push(target);
        }
      }
    }
  }
  return closure;
}

/** Consume one symbol from an already epsilon-closed set, then close the result. */
export function advance(
  automaton: Automaton,
  states: Iterable<string>,
  symbol: string,
): Set<string> {
  const targets = new Set<string>();
  for (const state of states) {
    for (const transition of automaton.getTransitionRecords(state, symbol)) {
      for (const target of transition.to) targets.add(target);
    }
  }
  return epsilonClosure(automaton, targets);
}

/** Canonical identity, deliberately independent of display separators. */
export function subsetKey(states: Iterable<string>): string {
  return JSON.stringify([...new Set(states)].sort());
}
