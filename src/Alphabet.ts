export default class Alphabet {
  symbols: Set<string>;

  constructor(symbols: string[]) {
    this.symbols = new Set(symbols);
  }

  addSymbol(symbol: string) {
    this.symbols.add(symbol);
  }

  removeSymbol(symbol: string) {
    this.symbols.delete(symbol);
  }

  hasSymbol(symbol: string): boolean {
    return this.symbols.has(symbol);
  }

  getSymbols(): string[] {
    return [...this.symbols];
  }
}
