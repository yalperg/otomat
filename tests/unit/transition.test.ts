import { Transition } from '@/index';
import { InvalidAutomatonError } from '@/errors';

describe('Transition', () => {
  it('creates a transition with valid data', () => {
    const t = Transition.create('q0', 'a', ['q1']);
    expect(t.from).toBe('q0');
    expect(t.input).toBe('a');
    expect(t.to).toEqual(['q1']);
  });

  it('deep copies the to array', () => {
    const arr = ['q2'];
    const t = Transition.create('q0', 'b', arr);
    arr[0] = 'changed';
    expect(t.to).toEqual(['q2']);
  });

  it('equals() returns true for identical transitions', () => {
    const t1 = Transition.create('q0', 'a', ['q1', 'q2']);
    const t2 = Transition.create('q0', 'a', ['q1', 'q2']);
    expect(t1.equals(t2)).toBe(true);
  });

  it('equals() returns false for different from', () => {
    const t1 = Transition.create('q0', 'a', ['q1']);
    const t2 = Transition.create('qX', 'a', ['q1']);
    expect(t1.equals(t2)).toBe(false);
  });

  it('equals() returns false for different input', () => {
    const t1 = Transition.create('q0', 'a', ['q1']);
    const t2 = Transition.create('q0', 'b', ['q1']);
    expect(t1.equals(t2)).toBe(false);
  });

  it('equals() returns false for different to arrays', () => {
    const t1 = Transition.create('q0', 'a', ['q1']);
    const t2 = Transition.create('q0', 'a', ['q2']);
    expect(t1.equals(t2)).toBe(false);
  });

  it('isDeterministic() returns true for single destination', () => {
    const t = Transition.create('q0', 'a', ['q1']);
    expect(t.isDeterministic()).toBe(true);
  });

  it('isDeterministic() returns false for multiple destinations', () => {
    const t = Transition.create('q0', 'a', ['q1', 'q2']);
    expect(t.isDeterministic()).toBe(false);
  });


  it('throws for empty from', () => {
    expect(() => Transition.create('', 'a', ['q1'])).toThrow(
      InvalidAutomatonError,
    );
  });

  it('throws for undefined input', () => {
    // @ts-expect-error Testing invalid input
    expect(() => Transition.create('q0', undefined, ['q1'])).toThrow(
      InvalidAutomatonError,
    );
  });

  it('throws for duplicate states in to array', () => {
    expect(() => Transition.create('q0', 'a', ['q1', 'q1'])).toThrow(
      InvalidAutomatonError,
    );
  });

  it('handles special characters in from, input, and to', () => {
    const t = Transition.create('q@', '!', ['q$', 'q#']);
    expect(t.from).toBe('q@');
    expect(t.input).toBe('!');
    expect(t.to).toEqual(['q$', 'q#']);
  });
});
