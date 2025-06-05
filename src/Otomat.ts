import DotExporter from '@/DotExporter';
import Automaton, { AutomatonConfig } from '@/models/automaton';
import NFAToDFAConverter from '@/NFAToDFAConverter';
import SimulationEngine, {
  SimulationOptions,
  SimulationResult,
} from '@/simulationEngine';

/**
 * Facade class for common automata workflows.
 * Provides static methods for parsing, simulating, converting, exporting, and serializing automata.
 */
export default class Otomat {
  /**
   * Create a new Automaton instance from the given configuration.
   * @param config - The configuration object for the automaton.
   * @returns {Automaton} The created Automaton instance.
   * @throws {ValidationError} If the configuration is invalid.
   */
  static create(config: AutomatonConfig): Automaton {
    return new Automaton(config);
  }

  /**
   * Simulate an automaton on the given input string.
   * @param automaton - The Automaton to simulate.
   * @param input - The input string to process.
   * @param options - Optional simulation options (e.g., step mode).
   * @returns {SimulationResult} The result of the simulation.
   * @throws {SimulationError} If the input or automaton is invalid.
   */
  static simulate(
    automaton: Automaton,
    input: string,
    options?: SimulationOptions,
  ): SimulationResult {
    return SimulationEngine.simulate(automaton, input, options);
  }

  /**
   * Convert an NFA to an equivalent DFA.
   * @param nfa - The NFA Automaton to convert.
   * @returns {Automaton} The equivalent DFA Automaton.
   * @throws {ConversionError} If the input is not a valid NFA.
   */
  static convertNFAToDFA(nfa: Automaton): Automaton {
    return NFAToDFAConverter.convert(nfa);
  }

  /**
   * Export an automaton to DOT format.
   * @param automaton - The Automaton to export.
   * @returns {string} The DOT format string.
   */
  static exportToDot(automaton: Automaton): string {
    return DotExporter.export(automaton);
  }
}
