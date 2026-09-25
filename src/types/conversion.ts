import type Automaton from '../models/automaton.js';

export interface NFAToDFAConvertOptions {
  stepByStep?: boolean;
}
export interface NFAToDFAConversionStep {
  currentSubset: string;
  symbol: string;
  nextSubset?: string | undefined;
  isNewSubset: boolean;
  transitions: { from: string; input: string; to: string }[];
}
export type SubsetState = Set<string>;
export interface NFAToDFATrace {
  dfa: Automaton;
  steps: NFAToDFAConversionStep[];
}
export type NFAToDFAResult = Automaton | NFAToDFATrace;
