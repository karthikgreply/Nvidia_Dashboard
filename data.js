// Simulated Financial Data & Scenarios

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSv8a_dcH7-7XUwLuHjVNnWPNEVtM9hWkVaPOVof4TevF0mpDG9Mw6CueCiQVc3rO4lzwWoE5YX_1nn/pub?gid=0&single=true&output=csv";

let nvdiaData = {
    labels: ['FY23 Actual', 'FY24 Actual', 'FY25 Outlook', 'FY26 Est', 'FY27 Baseline'],
    baseline: {
        revenue: [], operatingMargin: [], cashFlow: [], capEx: []
    },
    growthScenario: {
        labels: ['FY23 Actual', 'FY24 Actual', 'FY25 Outlook', 'FY26 Est', 'FY27 70% Growth'],
        revenue: [], operatingMargin: [], cashFlow: [], capEx: []
    }
};

async function fetchGoogleSheetData() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        
        const lines = csvText.trim().split(/\r?\n/);
        
        // Skip header row
        for(let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < 7) continue; // safety check
            
            const metric = cols[0].replace(/['"]/g, '').trim().toLowerCase();
            const scenario = cols[1].replace(/['"]/g, '').trim().toLowerCase();
            
            const values = [
                parseFloat(cols[2].replace(/[^0-9.-]+/g,"")),
                parseFloat(cols[3].replace(/[^0-9.-]+/g,"")),
                parseFloat(cols[4].replace(/[^0-9.-]+/g,"")),
                parseFloat(cols[5].replace(/[^0-9.-]+/g,"")),
                parseFloat(cols[6].replace(/[^0-9.-]+/g,""))
            ];
            
            let targetObj = scenario.includes('baseline') ? nvdiaData.baseline : nvdiaData.growthScenario;
            
            if (metric.includes('revenue')) targetObj.revenue = values;
            else if (metric.includes('margin')) targetObj.operatingMargin = values;
            else if (metric.includes('cash')) targetObj.cashFlow = values;
            else if (metric.includes('capex')) targetObj.capEx = values;
        }
        console.log("Data successfully loaded from Google Sheets!");
    } catch(err) {
        console.error("Failed to fetch Google Sheet data. Make sure it's published to the web.", err);
    }
}

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
