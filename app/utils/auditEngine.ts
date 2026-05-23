export interface ToolState {
  toolId: string;
  planId: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditFormState {
  teamSize: number;
  primaryUseCase: string;
  tools: ToolState[];
}

export interface AuditBreakdownItem {
  toolId: string;
  recommendedAction: 'KEEP' | 'DOWNGRADE' | 'CONSOLIDATE' | 'OPTIMIZE';
  savings: number;
  reason: string;
}

export interface FullAuditReport {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  breakdown: AuditBreakdownItem[];
}

// Main operational calculation engine logic loop
export function runAuditEngine(state: AuditFormState): FullAuditReport {
  let totalMonthlySavings = 0;
  const breakdown: AuditBreakdownItem[] = [];

  state.tools.forEach((tool) => {
    let savings = 0;
    let recommendedAction: 'KEEP' | 'DOWNGRADE' | 'CONSOLIDATE' | 'OPTIMIZE' = 'KEEP';
    let reason = 'Subscription tier aligns well with the current baseline workload profile.';

    // Rule 1: Redundancy overlap interception (Cursor vs GitHub Copilot)
    if (tool.toolId === 'copilot' && state.tools.some(t => t.toolId === 'cursor')) {
      savings = tool.monthlySpend;
      recommendedAction = 'CONSOLIDATE';
      reason = 'Redundant coding assistant overlap found. Cursor provides embedded model loops; separate Copilot seats are unnecessary.';
    }
    // Rule 2: Over-provisioned seat licensing optimization
    else if (tool.seats > state.teamSize) {
      const perSeatCost = tool.monthlySpend / tool.seats;
      const optimizedSeats = tool.seats - state.teamSize;
      savings = Math.round(perSeatCost * optimizedSeats);
      recommendedAction = 'OPTIMIZE';
      reason = `Discovered ${optimizedSeats} ghost seats. Downgrade active seat count allocations to match exact team size (${state.teamSize}).`;
    }
    // Rule 3: Enterprise tier anomalies tracking
    else if (tool.planId === 'enterprise' && state.teamSize < 15) {
      savings = Math.round(tool.monthlySpend * 0.3); // Expecting standard 30% overhead tier drop
      recommendedAction = 'DOWNGRADE';
      reason = 'Enterprise contracts under 15 seats exhibit sub-optimal utility margins. Downgrade to Business tier recommended.';
    }

    totalMonthlySavings += savings;
    breakdown.push({
      toolId: tool.toolId,
      recommendedAction,
      savings,
      reason,
    });
  });

  // If no tools are selected, inject standard empty tracking structures
  if (state.tools.length === 0) {
    breakdown.push({
      toolId: 'No Tools Selected',
      recommendedAction: 'KEEP',
      savings: 0,
      reason: 'Select at least one framework tool from the matrix configuration block to kickstart financial tracking logs.',
    });
  }

  return {
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    breakdown,
  };
}