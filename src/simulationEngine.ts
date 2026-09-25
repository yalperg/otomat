import { SimulationError } from './errors/index.js';
import type Automaton from './models/automaton.js';
import type Transition from './models/transition.js';
import { advance, epsilonClosure } from './algorithms/operations.js';
import type {
  SimulationInput,
  SimulationOptions,
  SimulationStep,
  SimulationResult,
} from './types/simulation.js';
export type {
  SimulationInput,
  SimulationOptions,
  SimulationStep,
  SimulationResult,
} from './types/simulation.js';

export default class SimulationEngine {
  static simulateStep(
    automaton: Automaton,
    states: ReadonlySet<string>,
    symbol: string,
  ): Set<string> {
    validateSymbol(automaton, symbol);
    return advance(automaton, epsilonClosure(automaton, states), symbol);
  }

  static simulate(
    automaton: Automaton,
    input: SimulationInput,
    options: { stepByStep: true },
  ): SimulationStep[];
  static simulate(
    automaton: Automaton,
    input: SimulationInput,
    options?: { stepByStep?: false },
  ): boolean;
  static simulate(
    automaton: Automaton,
    input: SimulationInput,
    options?: SimulationOptions,
  ): SimulationResult;
  static simulate(
    automaton: Automaton,
    input: SimulationInput,
    options?: SimulationOptions,
  ): SimulationResult {
    if (typeof input !== 'string' && !Array.isArray(input)) {
      throw new SimulationError(
        'Input must be a string or an array of symbols.',
      );
    }

    const symbols = [...input];
    // Validate the entire input, including symbols after a dead end.
    for (const symbol of symbols) validateSymbol(automaton, symbol);
    let states = epsilonClosure(automaton, automaton.startStates);
    const steps = options?.stepByStep
      ? [this.createSimulationStep(states)]
      : undefined;

    for (const symbol of symbols) {
      const transitions = steps
        ? applicableTransitions(automaton, states, symbol)
        : undefined;
      states = advance(automaton, states, symbol);
      steps?.push(this.createSimulationStep(states, symbol, transitions));
      if (!states.size) break;
    }

    return steps ?? [...states].some((state) => automaton.isAcceptState(state));
  }

  static computeEpsilonClosure(
    automaton: Automaton,
    states: ReadonlySet<string>,
  ): Set<string> {
    return epsilonClosure(automaton, states);
  }

  static createSimulationStep(
    states: ReadonlySet<string>,
    inputSymbol?: string,
    transitions: readonly Transition[] = [],
  ): SimulationStep {
    return {
      currentStates: [...states],
      inputSymbol,
      transitions: [...transitions],
      transition: transitions.length === 1 ? transitions[0] : undefined,
    };
  }

  static findApplicableTransitions(
    automaton: Automaton,
    states: ReadonlySet<string>,
    symbol: string,
  ): Transition[] {
    return applicableTransitions(
      automaton,
      epsilonClosure(automaton, states),
      symbol,
    );
  }
}

function validateSymbol(automaton: Automaton, symbol: string): void {
  if (!automaton.hasSymbol(symbol))
    throw new SimulationError(
      `Input symbol '${symbol}' not in automaton alphabet.`,
    );
}

function applicableTransitions(
  automaton: Automaton,
  states: Iterable<string>,
  symbol: string,
): Transition[] {
  return [...states].flatMap((state) =>
    automaton.getTransitionRecords(state, symbol),
  );
}
