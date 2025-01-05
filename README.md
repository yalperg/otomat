# Otomat

**Otomat** is a TypeScript library for working with Finite State Automata (FSA), specifically for converting Non-deterministic Finite Automata (NFA) to Deterministic Finite Automata (DFA).

## Usage

Here’s a basic example of how to create an NFA, convert it to a DFA, and interact with the automaton:

```typescript
import { NFA, State, Transition, Alphabet } from "otomat";

// Define states
const q1: State = "q1";
const q2: State = "q2";
const q3: State = "q3";
const q4: State = "q4";

// Define alphabet
const alphabet: Alphabet = ["a", "b"];

// Define transitions
const transitions: Transition[] = [
  { from: q1, to: q2, symbol: "a" },
  { from: q1, to: q4, symbol: "a" },
  { from: q2, to: q2, symbol: "a" },
  { from: q2, to: q3, symbol: "a" },
  { from: q3, to: q3, symbol: "a" },
  { from: q3, to: q3, symbol: "b" },
  { from: q3, to: q4, symbol: "b" },
  { from: q4, to: q4, symbol: "a" },
];

// Create NFA
const nfa = new NFA([q1, q2, q3, q4], transitions, q1, [q4], alphabet);

// Convert NFA to DFA
const dfa = nfa.toDFA();
```

### Using AutomataCreator to create an FSA from JSON

You can create an FSA (either DFA or NFA) directly from a JSON representation using the `AutomataCreator`:

```typescript
import { AutomataCreator, FSAJSON } from "otomat";

// Define a JSON representation of an NFA
const nfaJson: FSAJSON = {
  states: ["q0", "q1"],
  transitions: [
    { from: "q0", to: "q1", symbol: "a" },
    { from: "q1", to: "q0", symbol: "b" },
    { from: "q0", to: "q0", symbol: "ε" },
  ],
  startState: "q0",
  acceptStates: ["q1"],
  alphabet: ["a", "b"],
};

// Create an NFA or DFA based on the JSON structure
const automaton = AutomataCreator.createFromJSON(nfaJson);
```

## Architecture Diagram

The following UML diagram illustrates the architecture of the library:

![Architecture Diagram](./docs/architecture.png)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue on GitHub.
