import FSA from "./FSA";
import DFA from "./DFA";
import State from "./State";
import Transition from "./Transition";
import Alphabet from "./Alphabet";
import type { FSAJSON } from "../types";

/**
 * Represents a Nondeterministic Finite Automaton (NFA).
 * An NFA is a specific type of FSA where for each state and symbol,
 * there can be multiple transitions to different states, or no transition at all.
 * NFAs can also have epsilon (ε) transitions, which allow the automaton to transition
 * between states without consuming any input symbols.
 */
export default class NFA extends FSA {
  /**
   * Creates a new NFA.
   * @param states The set of states in the automaton.
   * @param transitions The set of transitions between states.
   * @param startState The initial state of the automaton.
   * @param acceptStates The set of accept states.
   * @param alphabet The alphabet of symbols used in transitions.
   */
  constructor(
    states: State[],
    transitions: Transition[],
    startState: State | null,
    acceptStates: State[],
    alphabet: Alphabet,
  ) {
    super(states, transitions, startState, acceptStates, alphabet);
  }

  /**
   * Generates a string key that uniquely identifies a set of states.
   * This key is used to track sets of states in the DFA conversion process.
   * @param states The set of states to generate a key for.
   * @returns A string key representing the set of states.
   */
  private stateSetName(states: Set<State>): string {
    return (
      [...states]
        .map((state) => state.name)
        .sort()
        .join(",") || "∅"
    );
  }

  /**
   * Returns a unique key for a given set of states.
   * @param states The set of states to generate a key for.
   * @returns A string key representing the set of states.
   */
  private stateSetKey(states: Set<State>): string {
    return this.stateSetName(states);
  }

  /**
   * Computes the epsilon closure for a given state.
   * The epsilon closure is the set of all states that can be reached
   * from the given state via epsilon (ε) transitions.
   * @param state The state for which to compute the epsilon closure.
   * @returns A set of states representing the epsilon closure.
   */
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

  /**
   * Computes the set of states that can be reached from a given set of states
   * by consuming a specific input symbol.
   * @param states The set of states to start from.
   * @param symbol The input symbol to consume.
   * @returns A set of states that can be reached by the input symbol.
   */
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

  /**
   * Computes the start state and its epsilon closure for the DFA conversion.
   * This method initializes the start state for the resulting DFA.
   * @returns An object containing the initial state set and the corresponding DFA start state.
   */
  private getDFAStartState(): { startState: Set<State>; dfaStartState: State } {
    const startState = this.epsilonClosure(this.startState!);
    const dfaStartState = new State(this.stateSetName(startState));
    return { startState, dfaStartState };
  }

  /**
   * Constructs the transitions for the resulting DFA from the current NFA.
   * This method iterates over unmarked states, processes transitions, and
   * populates the DFA with the corresponding states and transitions.
   * @param dfa The DFA being constructed.
   * @param dfaStates A map of DFA states corresponding to sets of NFA states.
   * @param unmarkedStates A stack of unmarked state sets to be processed.
   */
  private buildDFATransitions(
    dfa: DFA,
    dfaStates: Map<string, State>,
    unmarkedStates: Set<State>[],
  ): void {
    const symbols = new Set(this.transitions.map((t) => t.symbol));
    symbols.delete("ε"); // Remove epsilon

    while (unmarkedStates.length > 0) {
      const currentStates = unmarkedStates.pop()!;
      const currentDfaState = dfaStates.get(this.stateSetKey(currentStates))!;

      symbols.forEach((symbol) => {
        const moveResult = this.move(currentStates, symbol);
        const epsilonClosure = this.getEpsilonClosureForMove(moveResult);

        const key = this.stateSetKey(epsilonClosure);
        let toState: State;

        if (epsilonClosure.size > 0) {
          if (!dfaStates.has(key)) {
            const newState = new State(this.stateSetName(epsilonClosure));
            dfaStates.set(key, newState);
            dfa.addState(newState); // Ensure state is added to DFA states
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

      this.markAcceptStates(currentStates, dfa, currentDfaState);
    }
  }

  /**
   * Computes the epsilon closure for a given set of states after moving via a symbol.
   * This method is used during DFA construction to determine the resulting set of states.
   * @param moveResult The set of states reached by a move operation.
   * @returns A set of states representing the epsilon closure after the move.
   */
  private getEpsilonClosureForMove(moveResult: Set<State>): Set<State> {
    const epsilonClosure = new Set<State>();
    moveResult.forEach((state) => {
      this.epsilonClosure(state).forEach((s) => epsilonClosure.add(s));
    });
    return epsilonClosure;
  }

  /**
   * Marks a DFA state as an accept state if any of the corresponding NFA states are accept states.
   * @param currentStates The set of NFA states corresponding to the current DFA state.
   * @param dfa The DFA being constructed.
   * @param currentDfaState The current DFA state being processed.
   */
  private markAcceptStates(
    currentStates: Set<State>,
    dfa: DFA,
    currentDfaState: State,
  ): void {
    const isAcceptState = [...currentStates].some((state) =>
      this.acceptStates.includes(state),
    );
    if (isAcceptState) {
      dfa.addAcceptState([currentDfaState]);
    }
  }

  /**
   * Adds transitions to the empty state for any missing symbols in the DFA.
   * This ensures that the DFA has a complete set of transitions for all symbols in the alphabet.
   * @param dfa The DFA being constructed.
   * @param symbols The set of symbols in the alphabet.
   */
  private addMissingTransitions(dfa: DFA, symbols: Set<string>): void {
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
  }

  /**
   * Removes states from a DFA that cannot be reached from the start state.
   * This process can be used to simplify the DFA after conversion from an NFA.
   * @param dfa The DFA to simplify.
   */
  private removeUnreachableStates(dfa: DFA) {
    const reachableStates = new Set<State>();
    const stack = [dfa.startState!];

    while (stack.length > 0) {
      const state = stack.pop()!;
      if (!reachableStates.has(state)) {
        reachableStates.add(state);
        dfa.transitions.forEach((transition) => {
          if (
            transition.from === state &&
            !reachableStates.has(transition.to)
          ) {
            stack.push(transition.to);
          }
        });
      }
    }

    dfa.states = dfa.states.filter((state) => reachableStates.has(state));
    dfa.transitions = dfa.transitions.filter(
      (transition) =>
        reachableStates.has(transition.from) &&
        reachableStates.has(transition.to),
    );
    dfa.acceptStates = dfa.acceptStates.filter((state) =>
      reachableStates.has(state),
    );
  }

  /**
   * Generates all subsets (power set) of an array of elements.
   * @param arr The array to generate subsets from.
   * @returns An array of all possible subsets.
   */
  private powerSet<T>(arr: T[]): T[][] {
    return arr.reduce(
      (subsets, value) => subsets.concat(subsets.map((set) => [...set, value])),
      [[]] as T[][],
    );
  }

  /**
   * Converts this NFA to an equivalent DFA using the subset construction method.
   * This process may include the removal of unreachable states if specified.
   * @param removeUnreachableStates Whether to remove unreachable states in the resulting DFA.
   * @returns The equivalent DFA.
   */
  toDFA(removeUnreachableStates: boolean = false): DFA {
    const dfa = new DFA([], [], null, [], this.alphabet);
    const dfaStates = new Map<string, State>();
    const unmarkedStates: Set<State>[] = [];

    // Determine the DFA start state and its epsilon closure
    const { startState, dfaStartState } = this.getDFAStartState();
    dfa.addState(dfaStartState);
    dfa.setStartState(dfaStartState);
    dfaStates.set(this.stateSetKey(startState), dfaStartState);
    unmarkedStates.push(startState);

    // Generate all possible state sets
    const allStateSets = this.powerSet(this.states).map((set) => new Set(set));

    // Create DFA states for all state sets
    allStateSets.forEach((stateSet) => {
      const key = this.stateSetKey(stateSet);
      if (!dfaStates.has(key)) {
        const newState = new State(this.stateSetName(stateSet));
        dfaStates.set(key, newState);
        dfa.addState(newState);
        unmarkedStates.push(stateSet);
      }
    });

    // Build the DFA transitions
    this.buildDFATransitions(dfa, dfaStates, unmarkedStates);

    // Add transitions to the empty state for missing symbols
    const symbols = new Set(this.transitions.map((t) => t.symbol));
    symbols.delete("ε"); // Remove epsilon
    this.addMissingTransitions(dfa, symbols);

    // Remove unreachable states if specified
    if (removeUnreachableStates) {
      this.removeUnreachableStates(dfa);
    }

    return dfa;
  }

  /**
   * Creates an NFA from a JSON representation.
   * @param json The JSON representation of the NFA.
   * @returns A new NFA instance.
   */
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
