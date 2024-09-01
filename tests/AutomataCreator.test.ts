import AutomataCreator from "../src/core/AutomataCreator";
import DFA from "../src/core/DFA";
import NFA from "../src/core/NFA";
import { FSAJSON } from "../src/types";

describe("AutomataCreator", () => {
  test("createFromJSON creates a DFA", () => {
    const dfaJSON: FSAJSON = {
      states: ["q0", "q1"],
      alphabet: ["0", "1"],
      transitions: [
        { from: "q0", to: "q1", symbol: "0" },
        { from: "q0", to: "q0", symbol: "1" },
        { from: "q1", to: "q1", symbol: "0" },
        { from: "q1", to: "q0", symbol: "1" },
      ],
      startState: "q0",
      acceptStates: ["q1"],
    };

    const result = AutomataCreator.createFromJSON(dfaJSON);
    expect(result).toBeInstanceOf(DFA);
  });

  test("createFromJSON creates an NFA (with epsilon)", () => {
    const nfaJSON: FSAJSON = {
      states: ["q0", "q1"],
      alphabet: ["0", "1"],
      transitions: [
        { from: "q0", to: "q1", symbol: "0" },
        { from: "q0", to: "q0", symbol: "0" },
        { from: "q0", to: "q1", symbol: "ε" },
      ],
      startState: "q0",
      acceptStates: ["q1"],
    };

    const result = AutomataCreator.createFromJSON(nfaJSON);
    expect(result).toBeInstanceOf(NFA);
  });

  test("createFromJSON creates an NFA (without epsilon)", () => {
    const nfaJSON: FSAJSON = {
      states: ["q0", "q1"],
      alphabet: ["0", "1"],
      transitions: [
        { from: "q0", to: "q1", symbol: "0" },
        { from: "q0", to: "q0", symbol: "1" },
      ],
      startState: "q0",
      acceptStates: ["q1"],
    };

    const result = AutomataCreator.createFromJSON(nfaJSON);
    expect(result).toBeInstanceOf(NFA);
  });
});
