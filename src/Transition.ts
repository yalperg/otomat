import State from "./State";

export default class Transition {
  from: State;
  to: State;
  symbol: string;

  constructor(from: State, to: State, symbol: string) {
    this.from = from;
    this.to = to;
    this.symbol = symbol;
  }
}
