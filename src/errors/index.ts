/**
 * Represents an error that occurs during the validation of the automaton.
 * This error is thrown when the automaton's states, transitions, or symbols are invalid.
 */
export class ValidationError extends Error {
  /**
   * Creates a new validation error.
   * @param message A description of the validation error.
   */
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class StateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StateError";
  }
}

export class TransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransitionError";
  }
}
