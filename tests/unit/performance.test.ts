import {
  Automaton,
  NFAToDFAConverter,
  SimulationEngine,
  Transition,
} from '@/index';

const DFA_SIM_THRESH = Number(process.env.DFA_SIM_THRESH) || 0.01;
const NFA2DFA_SIM_THRESH = Number(process.env.NFA2DFA_SIM_THRESH) || 13;
const LARGE_ALPHA_THRESH = Number(process.env.LARGE_ALPHA_THRESH) || 8;

describe('Performance: Large Automata', () => {
  it('should simulate a large DFA efficiently', () => {
    const states = Array.from({ length: 100 }, (_, i) => `q${i}`);
    const alphabet = ['0', '1'];
    const transitions = [];

    for (let i = 0; i < 100; i++) {
      transitions.push(Transition.create(`q${i}`, '0', [`q${(i + 1) % 100}`]));
      transitions.push(
        Transition.create(`q${i}`, '1', [`q${(i * 7 + 3) % 100}`]),
      );
    }

    const dfa = new Automaton({
      states,
      alphabet,
      transitions,
      startStates: ['q0'],
      acceptStates: ['q25', 'q50', 'q75'],
    });

    const inputSizes = [100, 500, 1000, 2000];

    inputSizes.forEach((size) => {
      const input = Array.from({ length: size }, () =>
        Math.random() < 0.5 ? '0' : '1',
      ).join('');

      const stats = measurePerformance(() => {
        const result = SimulationEngine.simulate(dfa, input);
        expect(typeof result).toBe('boolean');
      }, 50);

      if (stats.median > size * DFA_SIM_THRESH) {
        console.warn(
          `WARNING: DFA sim (${size}) regression: ${stats.median.toFixed(3)}ms > threshold ${(size * DFA_SIM_THRESH).toFixed(3)}ms`,
        );
      }
      // Performance should scale linearly with input size
      expect(stats.median).toBeLessThan(size * DFA_SIM_THRESH); // 0.01ms per character

      console.log(
        `DFA simulation (${size} chars): ${stats.median.toFixed(3)}ms median`,
      );
    });
  });

  it('should convert NFA to DFA within reasonable time bounds', () => {
    const states = Array.from({ length: 15 }, (_, i) => `n${i}`);
    const alphabet = ['a', 'b', 'c'];
    const transitions = [];

    for (let i = 0; i < 15; i++) {
      transitions.push(
        Transition.create(`n${i}`, 'a', [
          `n${(i + 1) % 15}`,
          `n${(i + 2) % 15}`,
        ]),
      );
      transitions.push(
        Transition.create(`n${i}`, 'b', [
          `n${(i + 3) % 15}`,
          `n${(i + 5) % 15}`,
        ]),
      );
      transitions.push(Transition.create(`n${i}`, 'c', [`n${(i + 7) % 15}`]));
    }

    const nfa = new Automaton({
      states,
      alphabet,
      transitions,
      startStates: ['n0'],
      acceptStates: ['n7', 'n14'],
    });

    const conversionStats = measurePerformance(() => {
      const dfa = NFAToDFAConverter.convert(nfa);
      expect(dfa).toBeDefined();
      expect(dfa.states.size).toBeGreaterThan(0);
    }, 20);

    if (conversionStats.median > 100) {
      console.warn(
        `WARNING: NFA2DFA conversion regression: ${conversionStats.median.toFixed(3)}ms > threshold 100ms`,
      );
    }
    expect(conversionStats.median).toBeLessThan(100); // Should convert in under 100ms
    console.log(
      `NFA to DFA conversion: ${conversionStats.median.toFixed(3)}ms median`,
    );

    const dfa = NFAToDFAConverter.convert(nfa);
    const input = Array.from(
      { length: 1000 },
      () => ['a', 'b', 'c'][Math.floor(Math.random() * 3)],
    ).join('');

    const simulationStats = measurePerformance(() => {
      const result = SimulationEngine.simulate(dfa, input);
      expect(typeof result).toBe('boolean');
    }, 50);

    if (simulationStats.median > NFA2DFA_SIM_THRESH) {
      console.warn(
        `WARNING: NFA2DFA sim regression: ${simulationStats.median.toFixed(3)}ms > threshold ${NFA2DFA_SIM_THRESH}ms`,
      );
    }
    expect(simulationStats.median).toBeLessThan(NFA2DFA_SIM_THRESH); // Should simulate in under threshold
    console.log(
      `Converted DFA simulation: ${simulationStats.median.toFixed(3)}ms median`,
    );
  });

  it('should handle pathological cases efficiently', () => {
    const states = ['q0', 'q1', 'q2', 'q3', 'q4'];
    const alphabet = ['0', '1'];
    const transitions = [
      Transition.create('q0', '0', ['q0', 'q1']),
      Transition.create('q0', '1', ['q0']),
      Transition.create('q1', '0', ['q2']),
      Transition.create('q1', '1', ['q2']),
      Transition.create('q2', '0', ['q3']),
      Transition.create('q2', '1', ['q3']),
      Transition.create('q3', '0', ['q4']),
      Transition.create('q3', '1', ['q4']),
      Transition.create('q4', '0', ['q4']),
      Transition.create('q4', '1', ['q4']),
    ];

    const nfa = new Automaton({
      states,
      alphabet,
      transitions,
      startStates: ['q0'],
      acceptStates: ['q4'],
    });

    const conversionStats = measurePerformance(() => {
      const dfa = NFAToDFAConverter.convert(nfa);
      expect(dfa).toBeDefined();
    }, 10);

    expect(conversionStats.median).toBeLessThan(50);
    console.log(
      `Pathological NFA conversion: ${conversionStats.median.toFixed(3)}ms median`,
    );
  });

  it('should maintain performance with large alphabets', () => {
    const states = Array.from({ length: 20 }, (_, i) => `s${i}`);
    const alphabet = Array.from({ length: 50 }, (_, i) =>
      String.fromCharCode(97 + i),
    );
    const transitions = [];

    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < alphabet.length; j++) {
        transitions.push(
          Transition.create(`s${i}`, alphabet[j], [`s${(i + j) % 20}`]),
        );
      }
    }

    const dfa = new Automaton({
      states,
      alphabet,
      transitions,
      startStates: ['s0'],
      acceptStates: ['s10'],
    });

    const input = Array.from(
      { length: 500 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join('');

    const stats = measurePerformance(() => {
      const result = SimulationEngine.simulate(dfa, input);
      expect(typeof result).toBe('boolean');
    }, 30);

    if (stats.median > LARGE_ALPHA_THRESH) {
      console.warn(
        `WARNING: Large alphabet sim regression: ${stats.median.toFixed(3)}ms > threshold ${LARGE_ALPHA_THRESH}ms`,
      );
    }
    expect(stats.median).toBeLessThan(LARGE_ALPHA_THRESH); // Should handle large alphabets efficiently
    console.log(
      `Large alphabet simulation: ${stats.median.toFixed(3)}ms median`,
    );
  });

  // Regression test - compare performance against baseline
  it('should not regress in performance over time', () => {
    // This would require stored baseline measurements
    // For now, just ensure basic performance requirements are met

    const createSimpleAutomaton = (size: number) => {
      const states = Array.from({ length: size }, (_, i) => `q${i}`);
      const transitions = [];

      for (let i = 0; i < size - 1; i++) {
        transitions.push(Transition.create(`q${i}`, 'a', [`q${i + 1}`]));
      }
      transitions.push(Transition.create(`q${size - 1}`, 'a', [`q0`]));

      return new Automaton({
        states,
        alphabet: ['a'],
        transitions,
        startStates: ['q0'],
        acceptStates: [`q${size - 1}`],
      });
    };

    const sizes = [10, 20, 50, 100];
    const results: Array<{ size: number; time: number }> = [];

    sizes.forEach((size) => {
      const automaton = createSimpleAutomaton(size);
      const input = 'a'.repeat(size * 2);

      const stats = measurePerformance(() => {
        SimulationEngine.simulate(automaton, input);
      }, 20);

      results.push({ size, time: stats.median });
    });

    // Performance should scale reasonably (not exponentially)
    for (let i = 1; i < results.length; i++) {
      const ratio = results[i].time / results[i - 1].time;
      const sizeRatio = results[i].size / results[i - 1].size;

      // Time should not grow faster than quadratically with size
      expect(ratio).toBeLessThan(sizeRatio * sizeRatio);
    }

    console.log('Scaling results:', results);
  });
});

const measurePerformance = (
  fn: () => void,
  iterations = 100,
): {
  min: number;
  max: number;
  median: number;
  mean: number;
  p95: number;
} => {
  for (let i = 0; i < 10; i++) {
    fn();
  }

  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  return {
    min: times[0],
    max: times[times.length - 1],
    median: times[Math.floor(times.length / 2)],
    mean: times.reduce((a, b) => a + b) / times.length,
    p95: times[Math.floor(times.length * 0.95)],
  };
};
