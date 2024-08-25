/**
 * Represents the set of symbols used in the automaton.
 * The alphabet defines which symbols can be used in transitions.
 */
export default class Alphabet {
  symbols: Set<string>;

  /**
   * Creates a new alphabet from an array of symbols.
   * @param symbols An array of symbols to include in the alphabet.
   */
  constructor(symbols: string[]) {
    this.symbols = new Set(symbols);
  }

  /**
   * Adds a symbol to the alphabet.
   * @param symbol The symbol to add.
   */
  addSymbol(symbol: string) {
    this.symbols.add(symbol);
  }

  /**
   * Removes a symbol from the alphabet.
   * @param symbol The symbol to remove.
   */
  removeSymbol(symbol: string) {
    this.symbols.delete(symbol);
  }

  /**
   * Checks if a symbol is in the alphabet.
   * @param symbol The symbol to check.
   * @returns True if the symbol is in the alphabet, otherwise false.
   */
  hasSymbol(symbol: string): boolean {
    return this.symbols.has(symbol);
  }

  /**
   * Returns an array of all symbols in the alphabet.
   * @returns An array of symbols.
   */
  getSymbols(): string[] {
    return [...this.symbols];
  }
}
