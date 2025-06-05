import { SimulationError } from '@/errors';
import Automaton from '@/models/automaton';
import Transition from '@/models/transition';

/**
 * Engine for simulating DFA and NFA automata.
 */
export default class SimulationEngine {
  /**
   * Simulate a single step: given current states and an input symbol, return the set of next states.
   * Handles both DFA and NFA (no epsilon yet).
   */
  static simulateStep(
    automaton: Automaton,
    currentStates: Set<string>,
    inputSymbol: string,
  ): Set<string> {
    if (!automaton.alphabet.has(inputSymbol)) {
      throw new SimulationError(
        `Input symbol '${inputSymbol}' not in automaton alphabet.`,
      );
    }
    // Compute epsilon closure before consuming input
    const states = SimulationEngine.computeEpsilonClosure(
      automaton,
      currentStates,
    );
    const nextStates = new Set<string>();
    for (const state of states) {
      const toStates = automaton.getTransitions(state, inputSymbol);
      for (const toState of toStates) {
        nextStates.add(toState);
      }
    }
    // Compute epsilon closure after consuming input
    return SimulationEngine.computeEpsilonClosure(automaton, nextStates);
  }

  /**
   * Simulate the automaton on the given input string.
   * Returns true if accepted, false otherwise.
   */
  static simulate(
    automaton: Automaton,
    input: string,
    options?: SimulationOptions,
  ): SimulationResult {
    if (options && options.stepByStep) {
      // Step-by-step mode
      const steps: SimulationStep[] = [];
      let currentStates = SimulationEngine.computeEpsilonClosure(
        automaton,
        new Set(automaton.startStates),
      );
      // Initial step (before any input)
      steps.push(SimulationEngine.createSimulationStep(currentStates));
      for (const symbol of input) {
        if (!automaton.alphabet.has(symbol)) {
          throw new SimulationError(
            `Input symbol '${symbol}' not in automaton alphabet.`,
          );
        }
        const transitions = SimulationEngine.findApplicableTransitions(
          automaton,
          currentStates,
          symbol,
        );
        currentStates = SimulationEngine.simulateStep(automaton, currentStates, symbol);
        steps.push(
          SimulationEngine.createSimulationStep(currentStates, symbol, transitions),
        );
        if (currentStates.size === 0) break;
      }
      return steps;
    } else {
      // Fast mode (default)
      let currentStates = SimulationEngine.computeEpsilonClosure(
        automaton,
        new Set(automaton.startStates),
      );
      if (input.length === 0) {
        // Accept if any start state (after epsilon closure) is accept state
        for (const s of currentStates) {
          if (automaton.acceptStates.has(s)) return true;
        }
        return false;
      }
      for (const symbol of input) {
        if (!automaton.alphabet.has(symbol)) {
          throw new SimulationError(
            `Input symbol '${symbol}' not in automaton alphabet.`,
          );
        }
        currentStates = SimulationEngine.simulateStep(automaton, currentStates, symbol);
        if (currentStates.size === 0) return false;
      }
      for (const s of currentStates) {
        if (automaton.acceptStates.has(s)) return true;
      }
      return false;
    }
  }

  /**
   * Compute the epsilon closure of a set of states. (No epsilon support yet)
   * Returns the input set unchanged for now.
   */
  static computeEpsilonClosure(
    automaton: Automaton,
    states: Set<string>,
  ): Set<string> {
    // Epsilon closure: all states reachable from `states` via epsilon (ε) transitions
    const closure = new Set(states);
    const stack = [...states];
    while (stack.length > 0) {
      const state = stack.pop()!;
      for (const t of automaton.transitions) {
        if (t.from === state && t.input === 'ε') {
          for (const toState of t.to) {
            if (!closure.has(toState)) {
              closure.add(toState);
              stack.push(toState);
            }
          }
        }
      }
    }
    return closure;
  }

  /**
   * Helper: Create a SimulationStep object from current states, input symbol, and transitions.
   */
  static createSimulationStep(
    currentStates: Set<string>,
    inputSymbol?: string,
    transitions?: Transition[],
  ): SimulationStep {
    return {
      currentStates: Array.from(currentStates),
      inputSymbol,
      transition:
        transitions && transitions.length === 1 ? transitions[0] : undefined,
    };
  }

  /**
   * Helper: Find all transitions applicable from current states on input symbol.
   */
  static findApplicableTransitions(
    automaton: Automaton,
    currentStates: Set<string>,
    inputSymbol: string,
  ): Transition[] {
    const result: Transition[] = [];
    // Use epsilon closure of current states
    const closure = SimulationEngine.computeEpsilonClosure(
      automaton,
      currentStates,
    );
    for (const state of closure) {
      const toStates = automaton.getTransitions(state, inputSymbol);
      if (toStates.length > 0) {
        for (const t of automaton.transitions) {
          if (t.from === state && t.input === inputSymbol) {
            result.push(t);
          }
        }
      }
    }
    return result;
  }
}

/**
 * Represents a single step in a simulation.
 */
type SimulationStep = {
  currentStates: string[];
  inputSymbol?: string | undefined;
  transition?: Transition | undefined;
};

/**
 * Result of a simulation: boolean (accept/reject) or step-by-step trace.
 */
export type SimulationResult = boolean | SimulationStep[];

/**
 * Options for automaton simulation.
 */
export type SimulationOptions = {
  stepByStep?: boolean;
};
