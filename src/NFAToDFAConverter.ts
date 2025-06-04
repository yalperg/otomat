import { ConversionError } from '@/errors';
import Automaton from '@/models/automaton';
import Transition from '@/models/transition';
import SimulationEngine from '@/simulationEngine';

/**
 * Utility class for converting an NFA to an equivalent DFA using subset construction.
 */
export default class NFAToDFAConverter {
  /**
   * Convert an NFA Automaton to an equivalent DFA Automaton.
   * @param nfa The NFA Automaton to convert.
   * @param options Optional: If stepByStep is true, also returns the step-by-step conversion steps.
   * @returns DFA or {dfa, steps}
   * @throws {ConversionError} If the input is not a valid NFA.
   */
  // Overload signatures for precise return types
  static convert(
    nfa: Automaton,
    options: { stepByStep: true },
  ): { dfa: Automaton; steps: NFAToDFAConversionStep[] };
  static convert(nfa: Automaton, options?: { stepByStep?: false }): Automaton;
  static convert(
    nfa: Automaton,
    options?: NFAToDFAConvertOptions,
  ): Automaton | { dfa: Automaton; steps: NFAToDFAConversionStep[] } {
    if (options?.stepByStep) {
      return this.#convertStepByStep(nfa);
    }
    return this.#convertDirectly(nfa);
  }

  /**
   * Private method that performs the direct NFA→DFA conversion.
   */
  static #convertDirectly(nfa: Automaton): Automaton {
    if (!nfa.isNFA()) {
      throw new ConversionError('Input automaton is not an NFA.');
    }
    const stateSubsets = this.createStateSubsets(nfa);
    const dfaTransitions = this.createDFATransitions(nfa, stateSubsets);
    const dfaStates = Array.from(stateSubsets.keys());
    const nfaStartSubset = this.generateSubsetStateName(
      SimulationEngine.computeEpsilonClosure(nfa, nfa.startStates),
    );
    const dfaAcceptStates = Array.from(stateSubsets.entries())
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, subset]) =>
        Array.from(subset).some((s) => nfa.acceptStates.has(s)),
      )
      .map(([name]) => name);
    const dfaAlphabet = Array.from(nfa.alphabet);
    return new Automaton({
      states: dfaStates,
      alphabet: dfaAlphabet,
      transitions: dfaTransitions,
      startStates: [nfaStartSubset],
      acceptStates: dfaAcceptStates,
    });
  }

  /**
   * Step-by-step NFA→DFA conversion private API.
   * Each step records the new subset state and transitions.
   */
  static #convertStepByStep(nfa: Automaton): {
    dfa: Automaton;
    steps: NFAToDFAConversionStep[];
  } {
    if (!nfa.isNFA()) {
      throw new ConversionError('Input automaton is not an NFA.');
    }
    const steps: NFAToDFAConversionStep[] = [];
    const queue: SubsetState[] = [];
    const visited = new Map<string, SubsetState>();
    const transitions: Transition[] = [];
    const startSubset = SimulationEngine.computeEpsilonClosure(
      nfa,
      nfa.startStates,
    );
    const startName = this.generateSubsetStateName(startSubset);
    queue.push(startSubset);
    visited.set(startName, new Set(startSubset));
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentName = this.generateSubsetStateName(current);
      for (const symbol of nfa.alphabet) {
        let nextStates = new Set<string>();
        for (const state of current) {
          for (const t of nfa.transitions) {
            if (t.from === state && t.input === symbol) {
              t.to.forEach((s) => nextStates.add(s));
            }
          }
        }
        nextStates = SimulationEngine.computeEpsilonClosure(nfa, nextStates);
        const nextName = this.generateSubsetStateName(nextStates);
        const isNew = nextStates.size > 0 && !visited.has(nextName);
        if (nextStates.size > 0) {
          if (isNew) {
            visited.set(nextName, new Set(nextStates));
            queue.push(new Set(nextStates));
          }
          transitions.push(Transition.create(currentName, symbol, [nextName]));
        }
        steps.push({
          currentSubset: currentName,
          symbol,
          nextSubset: nextStates.size > 0 ? nextName : undefined,
          isNewSubset: isNew,
          transitions:
            nextStates.size > 0
              ? [{ from: currentName, input: symbol, to: nextName }]
              : [],
        });
      }
    }
    const dfaStates = Array.from(visited.keys());
    const dfaAcceptStates = Array.from(visited.entries())
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, subset]) =>
        Array.from(subset).some((s) => nfa.acceptStates.has(s)),
      )
      .map(([name]) => name);
    const dfaAlphabet = Array.from(nfa.alphabet);
    const dfa = new Automaton({
      states: dfaStates,
      alphabet: dfaAlphabet,
      transitions: transitions,
      startStates: [startName],
      acceptStates: dfaAcceptStates,
    });
    return { dfa, steps };
  }

  /**
   * Generate all reachable state subsets from the NFA.
   * @param nfa The NFA Automaton.
   * @returns {Map<string, SubsetState>} A map of subset names to state sets.
   */
  static createStateSubsets(nfa: Automaton): Map<string, SubsetState> {
    const queue: SubsetState[] = [];
    const visited = new Map<string, SubsetState>();
    // Epsilon closure of start states
    const startSubset = SimulationEngine.computeEpsilonClosure(
      nfa,
      nfa.startStates,
    );
    const startName = this.generateSubsetStateName(startSubset);
    queue.push(startSubset);
    visited.set(startName, new Set(startSubset));
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const symbol of nfa.alphabet) {
        // Epsilon closure of all reachable states after consuming symbol
        let nextStates = new Set<string>();
        for (const state of current) {
          for (const t of nfa.transitions) {
            if (t.from === state && t.input === symbol) {
              t.to.forEach((s) => nextStates.add(s));
            }
          }
        }
        // Epsilon closure of nextStates
        nextStates = SimulationEngine.computeEpsilonClosure(nfa, nextStates);
        const nextName = this.generateSubsetStateName(nextStates);
        if (nextStates.size > 0 && !visited.has(nextName)) {
          visited.set(nextName, new Set(nextStates));
          queue.push(new Set(nextStates));
        }
      }
    }
    return visited;
  }

  /**
   * Create deterministic DFA transitions for each subset.
   * @param nfa The NFA Automaton.
   * @param stateSubsets A map of subset names to state sets.
   * @returns {Transition[]} An array of DFA transitions.
   */
  static createDFATransitions(
    nfa: Automaton,
    stateSubsets: Map<string, SubsetState>,
  ): Transition[] {
    const transitions: Transition[] = [];
    for (const [subsetName, subset] of stateSubsets.entries()) {
      for (const symbol of nfa.alphabet) {
        // Epsilon closure of all reachable states after consuming symbol
        let nextStates = new Set<string>();
        for (const state of subset) {
          for (const t of nfa.transitions) {
            if (t.from === state && t.input === symbol) {
              t.to.forEach((s) => nextStates.add(s));
            }
          }
        }
        // Epsilon closure of nextStates
        nextStates = SimulationEngine.computeEpsilonClosure(nfa, nextStates);
        const nextName = this.generateSubsetStateName(nextStates);
        if (stateSubsets.has(nextName) && nextStates.size > 0) {
          transitions.push(Transition.create(subsetName, symbol, [nextName]));
        }
      }
    }
    return transitions;
  }

  /**
   * Generate a consistent name for a subset state (sorted, joined by _).
   * @param stateSet The set of states in the subset.
   * @returns {string} The generated subset state name.
   */
  static generateSubsetStateName(stateSet: SubsetState): string {
    return Array.from(stateSet).sort().join(', ') || '∅';
  }
}

interface NFAToDFAConvertOptions {
  stepByStep?: boolean;
}

interface NFAToDFAConversionStep {
  currentSubset: string; // Example: "q0, q1"
  symbol?: string; // The symbol being processed
  nextSubset?: string | undefined; // The new subset generated (if any)
  isNewSubset: boolean;
  transitions: { from: string; input: string; to: string }[];
}

type SubsetState = Set<string>;
