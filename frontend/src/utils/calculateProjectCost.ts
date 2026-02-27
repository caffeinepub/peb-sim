// Commercial Costing Engine

export interface RateCard {
  primarySteel: number;   // $/MT
  secondarySteel: number; // $/MT
  sheeting: number;       // $/sqm
  erectionLabor: number;  // $/sqm
}

export interface BuildingStats {
  primarySteelWeight: number;   // MT
  secondarySteelWeight: number; // MT
  sheetingArea: number;         // sqm
  floorArea: number;            // sqm
}

export interface CostBreakdown {
  primarySteelCost: number;
  secondarySteelCost: number;
  sheetingCost: number;
  erectionCost: number;
  totalCost: number;
  formattedTotal: string;
}

export function calculateProjectCost(rates: RateCard, stats: BuildingStats): CostBreakdown {
  const primarySteelCost = rates.primarySteel * stats.primarySteelWeight;
  const secondarySteelCost = rates.secondarySteel * stats.secondarySteelWeight;
  const sheetingCost = rates.sheeting * stats.sheetingArea;
  const erectionCost = rates.erectionLabor * stats.floorArea;
  const totalCost = primarySteelCost + secondarySteelCost + sheetingCost + erectionCost;

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalCost);

  return {
    primarySteelCost,
    secondarySteelCost,
    sheetingCost,
    erectionCost,
    totalCost,
    formattedTotal,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
