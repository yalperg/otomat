import FSA from "./FSA";
import DFA from "./DFA";
import type { Alphabet, FSAJSON, State, Transition } from "../types";

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
   * Converts the NFA to an equivalent DFA using the subset construction algorithm.
   * @param removeUnreachableStates Optional flag to remove unreachable states from the resulting DFA.
   * @returns The equivalent DFA.
   */
  toDFA(removeUnreachableStates: boolean = false): DFA {
    // Step 1: Initialize the DFA
    const dfa = new DFA([], [], null, [], this.alphabet);
    const dfaStates = new Map<string, State>();
    const unmarkedStates: string[] = [];

    // Step 2: Create the initial state of the DFA
    this.initializeDFAStartState(dfa, dfaStates, unmarkedStates);

    // Step 3: Process all unmarked states
    this.processUnmarkedStates(dfa, dfaStates, unmarkedStates);

    // Step 4: Optionally remove unreachable states
    if (removeUnreachableStates) {
      this.removeUnreachableStates(dfa);
    }

    return dfa;
  }

  /**
   * Initializes the start state of the DFA.
   * @param dfa The DFA being constructed.
   * @param dfaStates Map of DFA state keys to states.
   * @param unmarkedStates List of unmarked DFA states.
   */
  private initializeDFAStartState(
    dfa: DFA,
    dfaStates: Map<string, State>,
    unmarkedStates: string[],
  ): void {
    // Compute the epsilon closure of the NFA start state
    const startStateClosure = this.epsilonClosure(new Set([this.startState!]));
    const startStateKey = this.getStateSetKey(startStateClosure);

    // Add the start state to the DFA
    dfa.addState(startStateKey);
    dfa.setStartState(startStateKey);
    dfaStates.set(startStateKey, startStateKey);
    unmarkedStates.push(startStateKey);
  }

  /**
   * Processes all unmarked states in the DFA.
   * @param dfa The DFA being constructed.
   * @param dfaStates Map of DFA state keys to states.
   * @param unmarkedStates List of unmarked DFA states.
   */
  private processUnmarkedStates(
    dfa: DFA,
    dfaStates: Map<string, State>,
    unmarkedStates: string[],
  ): void {
    while (unmarkedStates.length > 0) {
      const currentStateKey = unmarkedStates.pop()!;
      const currentStates = this.getStatesFromKey(currentStateKey);

      // Process each symbol in the alphabet
      for (const symbol of this.alphabet) {
        if (symbol === "ε") continue; // Skip epsilon transitions

        // Compute the next state set
        const nextStates = this.epsilonClosure(
          this.move(currentStates, symbol),
        );
        const nextStateKey = this.getStateSetKey(nextStates);

        // Add new state to DFA if it doesn't exist
        this.addNewStateToDFA(dfa, dfaStates, unmarkedStates, nextStateKey);

        // Add transition to DFA
        dfa.addTransition({
          from: currentStateKey,
          to: nextStateKey,
          symbol,
        });
      }

      // Mark accept states
      this.markAcceptStates(dfa, currentStates, currentStateKey);
    }
  }

  /**
   * Adds a new state to the DFA if it doesn't already exist.
   * @param dfa The DFA being constructed.
   * @param dfaStates Map of DFA state keys to states.
   * @param unmarkedStates List of unmarked DFA states.
   * @param stateKey The key of the state to add.
   */
  private addNewStateToDFA(
    dfa: DFA,
    dfaStates: Map<string, State>,
    unmarkedStates: string[],
    stateKey: string,
  ): void {
    if (!dfaStates.has(stateKey)) {
      dfa.addState(stateKey);
      dfaStates.set(stateKey, stateKey);
      unmarkedStates.push(stateKey);
    }
  }

  /**
   * Marks accept states in the DFA.
   * @param dfa The DFA being constructed.
   * @param currentStates The current set of NFA states.
   * @param currentStateKey The key of the current DFA state.
   */
  private markAcceptStates(
    dfa: DFA,
    currentStates: Set<State>,
    currentStateKey: string,
  ): void {
    if ([...currentStates].some((state) => this.acceptStates.includes(state))) {
      dfa.addAcceptState([currentStateKey]);
    }
  }

  /**
   * Computes the epsilon closure for a given set of states.
   * @param states The set of states to start from.
   * @returns A set of states reachable through epsilon transitions.
   */
  private epsilonClosure(states: Set<State>): Set<State> {
    const closure = new Set(states);
    const stack = [...states];

    while (stack.length > 0) {
      const state = stack.pop()!;
      for (const transition of this.transitions) {
        if (
          transition.from === state &&
          transition.symbol === "ε" &&
          !closure.has(transition.to)
        ) {
          closure.add(transition.to);
          stack.push(transition.to);
        }
      }
    }

    return closure;
  }

  /**
   * Computes the set of states reachable from a given set of states by a given symbol.
   * @param states The set of states to start from.
   * @param symbol The transition symbol.
   * @returns A set of states reachable by the given symbol.
   */
  private move(states: Set<State>, symbol: string): Set<State> {
    const result = new Set<State>();
    for (const state of states) {
      for (const transition of this.transitions) {
        if (transition.from === state && transition.symbol === symbol) {
          result.add(transition.to);
        }
      }
    }
    return result;
  }

  /**
   * Generates a unique key for a set of states.
   * @param states The set of states.
   * @returns A string key representing the set of states.
   */
  private getStateSetKey(states: Set<State>): string {
    return [...states].sort().join(",") || "∅";
  }

  /**
   * Retrieves the set of states from a state set key.
   * @param key The state set key.
   * @returns A set of states represented by the key.
   */
  private getStatesFromKey(key: string): Set<State> {
    return new Set(key === "∅" ? [] : key.split(","));
  }

  /**
   * Removes unreachable states from the DFA.
   * @param dfa The DFA to remove unreachable states from.
   */
  private removeUnreachableStates(dfa: DFA): void {
    const reachableStates = new Set<State>();
    const stack: State[] = [dfa.startState!];

    // Find all reachable states
    while (stack.length > 0) {
      const currentState = stack.pop()!;
      if (!reachableStates.has(currentState)) {
        reachableStates.add(currentState);
        for (const transition of dfa.transitions) {
          if (
            transition.from === currentState &&
            !reachableStates.has(transition.to)
          ) {
            stack.push(transition.to);
          }
        }
      }
    }

    // Remove unreachable states and their associated transitions
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
