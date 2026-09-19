// Simulated Financial Data & Scenarios

const nvdiaData = {
    labels: ['FY23 Actual', 'FY24 Actual', 'FY25 Outlook', 'FY26 Est', 'FY27 Baseline'],
    
    // Baseline Scenario Data (in Billions)
    baseline: {
        revenue: [26.9, 60.9, 105.0, 120.0, 130.0],
        operatingMargin: [15.6, 54.1, 57.0, 58.0, 59.0], // Percentages (FY23: 15.6%, FY24: 54.1%)
        cashFlow: [3.8, 14.2, 48.0, 52.0, 55.0], // Free Cash Flow (FY24 was 14.2B)
        capEx: [1.8, 2.3, 6.0, 8.0, 10.0] // Capacity Investments (FY24 was ~2.3B)
    },

    // 70% Revenue Growth Scenario for FY27
    // Calculates a 70% increase on the FY27 Baseline, scaling other metrics
    growthScenario: {
        labels: ['FY23 Actual', 'FY24 Actual', 'FY25 Outlook', 'FY26 Est', 'FY27 70% Growth'],
        revenue: [26.9, 60.9, 105.0, 145.0, 221.0], // FY27 is 130 * 1.7 = 221
        operatingMargin: [15.6, 54.1, 57.0, 59.5, 58.5], // Slight margin compression due to capacity costs
        cashFlow: [3.8, 14.2, 48.0, 58.0, 85.0], // Higher cash flow, but offset by capEx
        capEx: [1.8, 2.3, 6.0, 18.0, 25.0] // Massive CapEx ramp up needed to support 221B revenue
    }
};

// Calculates NPV for capacity investments in the 70% growth scenario
function calculateNPV(discountRate = 0.1) {
    // Simplified cash flow deltas (Scenario - Baseline)
    // Years: FY25, FY26, FY27
    const cfDeltas = [
        0, // FY25: no change
        nvdiaData.growthScenario.cashFlow[3] - nvdiaData.baseline.cashFlow[3], // FY26
        nvdiaData.growthScenario.cashFlow[4] - nvdiaData.baseline.cashFlow[4]  // FY27
    ];
    
    const capExDeltas = [
        0,
        nvdiaData.growthScenario.capEx[3] - nvdiaData.baseline.capEx[3],
        nvdiaData.growthScenario.capEx[4] - nvdiaData.baseline.capEx[4]
    ];

    // Net Free Cash Flow Delta
    const netCashFlow = cfDeltas.map((cf, i) => cf - capExDeltas[i]);
    
    // NPV Calculation (simplified 3 year)
    let npv = 0;
    for (let i = 0; i < netCashFlow.length; i++) {
        npv += netCashFlow[i] / Math.pow((1 + discountRate), i + 1);
    }
    
    return npv.toFixed(1);
}

// IRR proxy calculation
function calculateIRR() {
    return 32; // Hardcoded estimate for demonstration
}
