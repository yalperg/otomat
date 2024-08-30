import { Alphabet } from "../types";

export function hasSymbol(alphabet: Alphabet, symbol: string): boolean {
  return alphabet.includes(symbol);
}

export function addSymbol(alphabet: Alphabet, symbol: string): Alphabet {
  return [...new Set([...alphabet, symbol])];
}

export function getSymbols(alphabet: Alphabet): string[] {
  return [...alphabet];
}
