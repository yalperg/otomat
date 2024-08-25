import FSA, { FSAJSON } from "./FSA";
import DFA from "./DFA";
import State from "./State";
import Transition from "./Transition";
import Alphabet from "./Alphabet";

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
   * Converts this NFA to an equivalent DFA using the subset construction method.
   * This process may include the removal of unreachable states if specified.
   * @param removeUnreachableStates Whether to remove unreachable states in the resulting DFA.
   * @returns The equivalent DFA.
   */
  toDFA(removeUnreachableStates: boolean = false): DFA {
    const dfa = new DFA([], [], null, [], this.alphabet);
    const dfaStates = new Map<string, State>();
    const unmarkedStates: Set<State>[] = [];
    const startState = this.epsilonClosure(this.startState!);
    const dfaStartState = new State(this.stateSetName(startState));

    dfa.addState(dfaStartState); // State is added to DFA before setting it as start state
    dfa.setStartState(dfaStartState);

    dfaStates.set(this.stateSetKey(startState), dfaStartState);
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

      const isAcceptState = [...currentStates].some((state) =>
        this.acceptStates.includes(state),
      );
      if (isAcceptState) {
        dfa.addAcceptState([currentDfaState]);
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
