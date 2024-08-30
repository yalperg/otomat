import { IFiniteStateAutomaton } from "../interfaces/IFiniteStateAutomaton";
import DFA from "../models/DFA";
import NFA from "../models/NFA";
import type { FSAJSON } from "../types";

export class AutomatonFactory {
  static createFromJSON(json: FSAJSON): IFiniteStateAutomaton {
    if (this.isDFA(json)) {
      return DFA.fromJSON(json);
    } else {
      return NFA.fromJSON(json);
    }
  }

  private static isDFA(json: FSAJSON): boolean {
    const symbolCounts = new Map<string, number>();
    for (const transition of json.transitions) {
      const key = `${transition.from}-${transition.symbol}`;
      symbolCounts.set(key, (symbolCounts.get(key) || 0) + 1);
    }
    return (
      Array.from(symbolCounts.values()).every((count) => count === 1) &&
      !json.transitions.some((t) => t.symbol === "ε")
    );
  }
}
