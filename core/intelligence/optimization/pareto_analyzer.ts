// GroIntel INT-5 — Pareto Analyzer
import { OptimizationOption, ParetoFrontier } from "./optimization_types";

export class ParetoAnalyzer {
  analyze(options: OptimizationOption[]): ParetoFrontier {
    const dominated: string[] = [];
    const nonDominated: string[] = [];

    for (const a of options) {
      let isDominated = false;
      for (const b of options) {
        if (a.id === b.id) continue;
        if (b.expected_value >= a.expected_value && b.risk <= a.risk && b.cost <= a.cost &&
            (b.expected_value > a.expected_value || b.risk < a.risk || b.cost < a.cost)) {
          isDominated = true;
          break;
        }
      }
      if (isDominated) dominated.push(a.id);
      else nonDominated.push(a.id);
    }

    return { options, dominated_options: dominated, non_dominated_options: nonDominated };
  }

  getBestBalanced(frontier: ParetoFrontier): OptimizationOption | null {
    const nonDom = frontier.options.filter(o => frontier.non_dominated_options.includes(o.id));
    if (nonDom.length === 0) return null;
    return nonDom.reduce((best, curr) =>
      (curr.expected_value - curr.risk - curr.cost * 0.5) > (best.expected_value - best.risk - best.cost * 0.5) ? curr : best
    );
  }

  getHighestUpside(frontier: ParetoFrontier): OptimizationOption | null {
    const nonDom = frontier.options.filter(o => frontier.non_dominated_options.includes(o.id));
    return nonDom.length > 0 ? nonDom.reduce((a, b) => a.expected_value > b.expected_value ? a : b) : null;
  }

  getLowestRisk(frontier: ParetoFrontier): OptimizationOption | null {
    const nonDom = frontier.options.filter(o => frontier.non_dominated_options.includes(o.id));
    return nonDom.length > 0 ? nonDom.reduce((a, b) => a.risk < b.risk ? a : b) : null;
  }
}
