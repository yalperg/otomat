import FSA, { FSAJSON } from "./FSA";
import DFA from "./DFA";
import State from "./State";
import Transition from "./Transition";
import Alphabet from "./Alphabet";

export default class NFA extends FSA {
  constructor(
    states: State[],
    transitions: Transition[],
    startState: State | null,
    acceptStates: State[],
    alphabet: Alphabet,
  ) {
    super(states, transitions, startState, acceptStates, alphabet);
  }

  private stateSetName(states: Set<State>): string {
    return (
      [...states]
        .map((state) => state.name)
        .sort()
        .join(",") || "∅"
    );
  }

  private stateSetKey(states: Set<State>): string {
    return this.stateSetName(states);
  }

  private epsilonClosure(state: State): Set<State> {
    const closure = new Set([state]);
    const stack = [state];

    while (stack.length > 0) {
      const s = stack.pop()!;
      this.transitions.forEach((transition) => {
        if (
          transition.from === s &&
          transition.symbol === "ε" &&
          !closure.has(transition.to)
        ) {
          closure.add(transition.to);
          stack.push(transition.to);
        }
      });
    }

    return closure;
  }

  private move(states: Set<State>, symbol: string): Set<State> {
    const result = new Set<State>();
    states.forEach((state) => {
      this.transitions.forEach((transition) => {
        if (transition.from === state && transition.symbol === symbol) {
          result.add(transition.to);
        }
      });
    });
    return result;
  }

  toDFA(): DFA {
    /*
     * TODO:
     * Refactor and split the method into smaller methods.
     * Consider using an array and object instead of a map and set.
     * I prefer Set and Map to use the built-in methods. But I'm not sure about the performance difference.
     */

    const dfa = new DFA([], [], null, [], this.alphabet);
    const dfaStates = new Map<string, State>();
    const unmarkedStates: Set<State>[] = [];
    const startState = this.epsilonClosure(this.startState!);
    const dfaStartState = new State(this.stateSetName(startState));
    dfa.setStartState(dfaStartState);
    dfaStates.set(this.stateSetKey(startState), dfaStartState);
    dfa.addState(dfaStartState);
    unmarkedStates.push(startState);

    const symbols = new Set(this.transitions.map((t) => t.symbol));
    symbols.delete("ε"); // Remove epsilon

    while (unmarkedStates.length > 0) {
      const currentStates = unmarkedStates.pop()!;
      const currentDfaState = dfaStates.get(this.stateSetKey(currentStates))!;

      symbols.forEach((symbol) => {
        const moveResult = this.move(currentStates, symbol);
        const epsilonClosure = new Set<State>();
        moveResult.forEach((state) => {
          this.epsilonClosure(state).forEach((s) => epsilonClosure.add(s));
        });

        const key = this.stateSetKey(epsilonClosure);
        let toState: State;

        if (epsilonClosure.size > 0) {
          if (!dfaStates.has(key)) {
            const newState = new State(this.stateSetName(epsilonClosure));
            dfaStates.set(key, newState);
            dfa.addState(newState);
            unmarkedStates.push(epsilonClosure);
          }
          toState = dfaStates.get(key)!;
        } else {
          toState = dfa.emptyState;
          if (!dfa.states.includes(dfa.emptyState)) {
            dfa.addState(dfa.emptyState);
          }
        }

        dfa.addTransition(new Transition(currentDfaState, toState, symbol));
      });

      const isAcceptState = [...currentStates].some((state) =>
        this.acceptStates.includes(state),
      );
      if (isAcceptState) {
        dfa.addAcceptState(currentDfaState);
      }
    }

    // Add transitions to empty state for missing symbols
    dfa.states.forEach((dfaState) => {
      symbols.forEach((symbol) => {
        const transitionExists = dfa.transitions.some(
          (t) => t.from === dfaState && t.symbol === symbol,
        );
        if (!transitionExists) {
          dfa.addTransition(new Transition(dfaState, dfa.emptyState, symbol));
        }
      });
    });

    return dfa;
  }

  static fromJSON(json: FSAJSON): NFA {
    const fsa = FSA.fromJSON(json);
    return new NFA(
      fsa.states,
      fsa.transitions,
      fsa.startState,
      fsa.acceptStates,
      fsa.alphabet,
    );
  }
}
