# Otomat

**Otomat** is a TypeScript library for working with Finite State Automata (FSA), specifically for converting Non-deterministic Finite Automata (NFA) to Deterministic Finite Automata (DFA). This library provides fundamental operations for states, transitions, and alphabets in FSAs, along with conversion and validation capabilities.

## Features

- **Finite State Automaton (FSA):** Base class representing the general structure of FSAs.
- **Deterministic Finite Automaton (DFA):** Extends FSA with deterministic behavior, ensuring exactly one transition per symbol in each state.
- **Non-deterministic Finite Automaton (NFA):** Extends FSA with non-deterministic behavior, allowing multiple transitions for the same symbol or epsilon (ε) transitions.
- **NFA to DFA Conversion:** Converts an NFA to an equivalent DFA using the subset construction method.
- **Validation:** Built-in validation for ensuring the correctness of transitions and states.
- **Error Handling:** Comprehensive error handling using custom `ValidationError` class.

## Installation

To install the library, use npm or yarn:

```bash
npm install otomat
yarn add otomat
```

## Usage

Here’s a basic example of how to create an NFA, convert it to a DFA, and interact with the automaton:

```typescript
import { NFA, State, Transition, Alphabet } from "otomat";

// Define states
const q0 = new State("q0");
const q1 = new State("q1");

// Define alphabet
const alphabet = new Alphabet(["a", "b"]);

// Define transitions
const transitions = [
  new Transition(q0, q1, "a"),
  new Transition(q1, q0, "b"),
  new Transition(q0, q0, "ε"),
];

// Create NFA
const nfa = new NFA([q0, q1], transitions, q0, [q1], alphabet);

// Convert NFA to DFA
const dfa = nfa.toDFA();
```

## Architecture Diagram

The following UML diagram illustrates the architecture of the library:

![Architecture Diagram](./docs/architecture.png)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue on GitHub.
