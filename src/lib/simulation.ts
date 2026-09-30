export type ResourceState = {
  bedOccupancy: number; // percentage 0-100
  icuOccupancy: number; // percentage 0-100
  staffAvailable: number; // count
  orUtilization: number; // percentage 0-100
  emergencyReserve: number; // percentage 0-100
  emergencyArrivals: number; // count
};

export type ScenarioPreset = "NORMAL" | "ICU_SURGE" | "STAFF_SHORTAGE" | "EMERGENCY_SPIKE" | "OR_OVERLOAD";

export const SCENARIOS: Record<ScenarioPreset, ResourceState> = {
  NORMAL: {
    bedOccupancy: 78,
    icuOccupancy: 72,
    staffAvailable: 42,
    orUtilization: 71,
    emergencyReserve: 64,
    emergencyArrivals: 5,
  },
  ICU_SURGE: {
    bedOccupancy: 82,
    icuOccupancy: 85,
    staffAvailable: 32,
    orUtilization: 68,
    emergencyReserve: 45,
    emergencyArrivals: 12,
  },
  STAFF_SHORTAGE: {
    bedOccupancy: 80,
    icuOccupancy: 78,
    staffAvailable: 18,
    orUtilization: 65,
    emergencyReserve: 50,
    emergencyArrivals: 8,
  },
  EMERGENCY_SPIKE: {
    bedOccupancy: 88,
    icuOccupancy: 80,
    staffAvailable: 35,
    orUtilization: 85,
    emergencyReserve: 15,
    emergencyArrivals: 24,
  },
  OR_OVERLOAD: {
    bedOccupancy: 85,
    icuOccupancy: 75,
    staffAvailable: 30,
    orUtilization: 95,
    emergencyReserve: 55,
    emergencyArrivals: 7,
  }
};

export type OptimizationAction = {
  id: string;
  action: string;
  why: string;
  constraintCheck: string;
};

export type OptimizationPlan = {
  actions: OptimizationAction[];
  impact: {
    icuPeak: [number, number];
    staffConflict: [number, number];
    emergencyReserve: [number, number];
    delayedProcedures: [number, number];
  };
  isFeasible: boolean;
};

export function forecastICU(state: ResourceState): number {
  // Deterministic forecast logic
  const peak = state.icuOccupancy + (state.emergencyArrivals * 0.8) - (state.staffAvailable * 0.1);
  return Math.min(Math.max(Math.round(peak), 0), 100);
}

export function detectBottleneck(state: ResourceState) {
  const icuPeak = forecastICU(state);
  
  if (icuPeak > 90) {
    return {
      resource: "ICU CAPACITY",
      severity: "HIGH",
      reason: `Projected emergency arrivals + current ICU occupancy may exceed available staffed ICU capacity.`,
      current: state.icuOccupancy,
      peak: icuPeak,
      availableStaff: state.staffAvailable
    };
  } else if (state.staffAvailable < 25) {
    return {
      resource: "STAFF AVAILABILITY",
      severity: "HIGH",
      reason: "Projected staffing requirements across wards will exceed scheduled personnel for the next shift.",
      current: state.staffAvailable,
      peak: state.staffAvailable - 8,
      availableStaff: state.staffAvailable
    };
  } else if (state.emergencyReserve < 30) {
    return {
      resource: "EMERGENCY RESERVE",
      severity: "CRITICAL",
      reason: "High influx of emergency arrivals is depleting the ER buffer.",
      current: state.emergencyReserve,
      peak: Math.max(state.emergencyReserve - 15, 5),
      availableStaff: state.staffAvailable
    };
  }
  
  return null;
}

export function generatePlan(state: ResourceState, scenario: ScenarioPreset): OptimizationPlan {
  const icuPeak = forecastICU(state);
  
  if (scenario === "ICU_SURGE" || icuPeak > 90) {
    return {
      isFeasible: true,
      actions: [
        {
          id: "1",
          action: "Reassign 3 available nurses",
          why: "Moving three available nurses to ICU keeps projected staffing above the configured minimum during the predicted demand peak.",
          constraintCheck: "Shift availability verified."
        },
        {
          id: "2",
          action: "Reserve 2 ICU beds",
          why: "Predicted ICU demand exceeds safe operating capacity in 3 hours.",
          constraintCheck: "Emergency reserve maintained."
        },
        {
          id: "3",
          action: "Shift 4 eligible patients",
          why: "Frees acute care beds for incoming emergency transfers.",
          constraintCheck: "Ward bed capacity within limit."
        },
        {
          id: "4",
          action: "Delay 1 low-priority procedure",
          why: "Conserves immediate post-op monitoring resources.",
          constraintCheck: "OR utilization remains balanced."
        }
      ],
      impact: {
        icuPeak: [icuPeak, Math.round(icuPeak - 6)],
        staffConflict: [3, 0],
        emergencyReserve: [state.emergencyReserve, state.emergencyReserve + 10],
        delayedProcedures: [0, 1]
      }
    };
  } else if (scenario === "STAFF_SHORTAGE") {
    return {
      isFeasible: true,
      actions: [
        {
          id: "1",
          action: "Activate 2 on-call staff",
          why: "Current staffing falls below minimum safety ratios for general wards.",
          constraintCheck: "Budget and union rules respected."
        },
        {
          id: "2",
          action: "Consolidate 2 underutilized wards",
          why: "Reduces overhead nursing requirements for the next 8 hours.",
          constraintCheck: "Patient acuity levels match."
        }
      ],
      impact: {
        icuPeak: [icuPeak, icuPeak],
        staffConflict: [5, 0],
        emergencyReserve: [state.emergencyReserve, state.emergencyReserve],
        delayedProcedures: [0, 0]
      }
    };
  } else if (scenario === "EMERGENCY_SPIKE") {
     return {
      isFeasible: true,
      actions: [
        {
          id: "1",
          action: "Divert non-critical ambulances",
          why: "Emergency reserve is critical; immediate capacity required for walk-in traumas.",
          constraintCheck: "Regional network capacity confirmed."
        },
        {
          id: "2",
          action: "Deploy rapid triage team",
          why: "Accelerates processing of waiting room to preserve ER bays.",
          constraintCheck: "Specialized staff available."
        }
      ],
      impact: {
        icuPeak: [icuPeak, icuPeak - 2],
        staffConflict: [1, 0],
        emergencyReserve: [state.emergencyReserve, state.emergencyReserve + 25],
        delayedProcedures: [0, 0]
      }
    };
  }
  
  // Default optimization for normal or unhandled
  return {
    isFeasible: true,
    actions: [
      {
        id: "1",
        action: "Balance nursing assignments",
        why: "Proactively distributes workload ahead of minor evening admission spike.",
        constraintCheck: "All wards fully staffed."
      }
    ],
    impact: {
      icuPeak: [icuPeak, icuPeak],
      staffConflict: [0, 0],
      emergencyReserve: [state.emergencyReserve, state.emergencyReserve],
      delayedProcedures: [0, 0]
    }
  };
}

// Generate deterministic forecast data for charts
export function generateForecastData(state: ResourceState) {
  const data = [];
  let currentIcu = state.icuOccupancy;
  let currentBeds = state.bedOccupancy;
  
  const now = new Date();
  now.setMinutes(0, 0, 0);
  
  for (let i = 0; i <= 6; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:00`;
    
    // Simulate trend
    if (i > 0) {
       currentIcu += (state.emergencyArrivals * 0.15) - (state.staffAvailable * 0.02);
       currentBeds += (state.emergencyArrivals * 0.2) - 1;
    }
    
    data.push({
      time: timeStr,
      icuOccupancy: Math.min(Math.max(Math.round(currentIcu), 0), 100),
      bedOccupancy: Math.min(Math.max(Math.round(currentBeds), 0), 100),
      safeThreshold: 90
    });
  }
  
  return data;
}
