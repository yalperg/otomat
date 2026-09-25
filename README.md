# Otomat

A TypeScript library for finite automata: NFA/DFA simulation, epsilon transitions,
NFA → DFA conversion, step traces, JSON round trips and Graphviz DOT export.
The package is ESM, includes TypeScript declarations, and has no runtime dependencies.
Development and package checks require Node.js 20 or later.

## Quick start

```ts
import Otomat, { Automaton, EPSILON } from 'otomat';

const nfa = new Automaton({
  states: ['start', 'ready', 'accept'],
  alphabet: ['a'],
  transitions: [
    { from: 'start', input: EPSILON, to: ['ready'] },
    { from: 'ready', input: 'a', to: ['ready', 'accept'] },
  ],
  startStates: ['start'],
  acceptStates: ['accept'],
});

Otomat.simulate(nfa, 'aaa'); // true
const dfa = Otomat.convertNFAToDFA(nfa);
Otomat.simulate(dfa, 'aaa'); // true

const { steps } = Otomat.convertNFAToDFA(nfa, { stepByStep: true });
const trace = Otomat.simulate(nfa, 'aaa', { stepByStep: true });
const restored = Otomat.parse(Otomat.serialize(nfa));
restored.equals(nfa); // true
const dot = Otomat.exportToDot(dfa);
```

## Project layout

```text
src/
  index.ts                   Public package exports
  Otomat.ts                  Convenience facade
  NFAToDFAConverter.ts        Conversion API and compatibility helpers
  simulationEngine.ts        Simulation API and traces
  DotExporter.ts             Graphviz adapter
  algorithms/
    operations.ts            Indexed epsilon closure, move, subset identity
    determinize.ts           Shared direct/traced breadth-first conversion
  models/                    Immutable automaton and transition models
  types/                     Configuration, simulation and conversion contracts
  utils/validator.ts         Runtime validation boundary
  errors/                    Public error hierarchy

tests/
  unit/                      Regression, contract and language-oracle tests
  types/                     Positive/negative TypeScript API assertions
  integration/               Packed release tested as an external consumer
  performance/               Reproducible performance smoke checks
```

## Development

```sh
pnpm install --frozen-lockfile
pnpm run check          # Typecheck, lint, unit tests, build/pack/consumer tests
pnpm run test:coverage  # Unit tests with coverage
pnpm run test:perf      # Separate performance smoke checks, without coverage
pnpm run build         # Clean dist, emit .d.ts, bundle ESM
pnpm run dev           # Watch source; validate/emit declarations on rebuild
```
