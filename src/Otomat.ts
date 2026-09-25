import DotExporter from './DotExporter.js';
import Automaton from './models/automaton.js';
import type { AutomatonConfig } from './types/automaton.js';
import NFAToDFAConverter from './NFAToDFAConverter.js';
import SimulationEngine from './simulationEngine.js';
export default class Otomat {
  static create(config: AutomatonConfig): Automaton {
    return new Automaton(config);
  }

  static readonly simulate = SimulationEngine.simulate.bind(SimulationEngine);
  static readonly convertNFAToDFA = NFAToDFAConverter.convert.bind(NFAToDFAConverter);

  static exportToDot(automaton: Automaton): string {
    return DotExporter.export(automaton);
  }
  static serialize(automaton: Automaton): string {
    return JSON.stringify(automaton);
  }
  static parse(json: string): Automaton {
    return Automaton.fromJSON(json);
  }
}
