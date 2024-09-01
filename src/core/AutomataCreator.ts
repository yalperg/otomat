import DFA from "./DFA";
import NFA from "./NFA";
import type { FSAJSON, IFSA } from "../types";
import { EPSILON_SYMBOL } from "../constants";

class AutomataCreator {
  static createFromJSON(json: FSAJSON): IFSA {
    if (this.isDFA(json)) {
      return DFA.fromJSON(json);
    } else {
      return NFA.fromJSON(json);
    }
  }

  private static isDFA(json: FSAJSON): boolean {
    const transitionMap = new Map<string, Set<string>>();

    for (const transition of json.transitions) {
      if (transition.symbol === EPSILON_SYMBOL) return false;

      const key = `${transition.from}-${transition.symbol}`;
      if (transitionMap.has(key)) return false;

      transitionMap.set(key, new Set([transition.to]));
    }

    return json.states.every((state) =>
      json.alphabet.every((symbol) => transitionMap.has(`${state}-${symbol}`)),
    );
  }
}

export default AutomataCreator;
