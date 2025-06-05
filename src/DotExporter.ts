import Automaton from '@/models/automaton';

export default class DotExporter {
  /**
   * Export the given automaton to DOT (Graphviz) format.
   * @param automaton The automaton to export.
   * @returns DOT format string representing the automaton.
   */
  static export(automaton: Automaton): string {
    const nodes = this.generateNodeDefinitions(automaton);
    const edges = this.generateEdgeDefinitions(automaton);
    return ['digraph Automaton {', '  rankdir=LR;', nodes, edges, '}'].join(
      '\n',
    );
  }

  /**
   * Generate DOT node definitions for all states in the automaton.
   * @param automaton The automaton whose states to export.
   * @returns DOT node definitions as a string.
   */
  static generateNodeDefinitions(automaton: Automaton): string {
    const lines: string[] = [];
    
    // Create invisible start nodes for each start state
    for (const state of automaton.startStates) {
      lines.push(`  "start_${this.escape(state)}" [shape=point, style=invis];`);
    }
    
    // Create actual state nodes
    for (const state of automaton.states) {
      const isStart = automaton.startStates.has(state);
      const isAccept = automaton.acceptStates.has(state);
      lines.push(
        `  "${this.escape(state)}"${this.formatNodeAttributes(isStart, isAccept)};`,
      );
    }
    
    // Create invisible edges from start points to start states
    for (const state of automaton.startStates) {
      lines.push(`  "start_${this.escape(state)}" -> "${this.escape(state)}";`);
    }
    
    return lines.join('\n');
  }

  /**
   * Generate DOT edge definitions for all transitions in the automaton.
   * @param automaton The automaton whose transitions to export.
   * @returns DOT edge definitions as a string.
   */
  static generateEdgeDefinitions(automaton: Automaton): string {
    const edgeMap = new Map<
      string,
      { from: string; to: string; labels: string[] }
    >();
    for (const t of automaton.transitions) {
      for (const to of t.to) {
        const key = `${t.from}__${to}`;
        if (!edgeMap.has(key)) {
          edgeMap.set(key, { from: t.from, to, labels: [] });
        }
        edgeMap.get(key)!.labels.push(t.input);
      }
    }
    const lines: string[] = [];
    for (const { from, to, labels } of edgeMap.values()) {
      lines.push(
        `  "${this.escape(from)}" -> "${this.escape(to)}" [label="${labels.map(this.escape).join(',')}"];`,
      );
    }
    return lines.join('\n');
  }

  /**
   * Format DOT node attributes for a state.
   * @param isStart Whether the state is a start state.
   * @param isAccept Whether the state is an accept state.
   * @returns DOT node attribute string.
   */
  static formatNodeAttributes(isStart: boolean, isAccept: boolean): string {
    const attrs: string[] = [];
    if (isAccept) attrs.push('shape=doublecircle');
    if (isStart) attrs.push('color=blue');
    return attrs.length ? ` [${attrs.join(', ')}]` : '';
  }

  /**
   * Escape special characters for DOT identifiers/labels.
   * @param str The string to escape.
   * @returns The escaped string.
   */
  static escape(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}
