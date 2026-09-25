import type Transition from '../models/transition.js';

/** Strings are read as Unicode code points; arrays supply explicit alphabet tokens. */
export type SimulationInput = string | readonly string[];
export interface SimulationOptions {
  stepByStep?: boolean;
}
export interface SimulationStep {
  currentStates: string[];
  inputSymbol?: string | undefined;
  /** Legacy shorthand, present only when exactly one consuming record applies. */
  transition?: Transition | undefined;
  /** All consuming records. Epsilon reachability is reflected in currentStates. */
  transitions: readonly Transition[];
}
export type SimulationResult = boolean | SimulationStep[];
