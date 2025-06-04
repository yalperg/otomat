/**
 * Base error class for all automata-related errors.
 */
export class AutomataError extends Error {
  /**
   * @param message Error message
   * @param cause Optional underlying error
   */
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'AutomataError';
    if (cause) this.stack += '\nCaused by: ' + cause.stack;
  }
}

/**
 * Error thrown for invalid automaton definitions or operations.
 */
export class InvalidAutomatonError extends AutomataError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'InvalidAutomatonError';
  }
}

/**
 * Error thrown for simulation failures or invalid simulation input.
 */
export class SimulationError extends AutomataError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'SimulationError';
  }
}
