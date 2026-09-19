// Dashboard Logic

// Chart instances
let revMarginChart;
let cfChart;

// DOM Elements
const scenarioToggle = document.getElementById('scenarioToggle');
const kpiRevenue = document.getElementById('kpi-revenue');
const kpiRevenueTrend = document.getElementById('kpi-revenue-trend');
const kpiMargin = document.getElementById('kpi-margin');
const kpiMarginTrend = document.getElementById('kpi-margin-trend');
const kpiFcf = document.getElementById('kpi-fcf');
const kpiFcfTrend = document.getElementById('kpi-fcf-trend');
const kpiCapex = document.getElementById('kpi-capex');
const kpiCapexTrend = document.getElementById('kpi-capex-trend');
const kpiNpv = document.getElementById('kpi-npv');
const kpiIrr = document.getElementById('kpi-irr');

// Helper to format currency
const formatCurr = (val) => `$${val.toFixed(1)}B`;

// Initialize Charts
function initCharts() {
    // Chart Defaults
    Chart.defaults.color = '#9ba1a6';
    Chart.defaults.font.family = 'Inter';
    
    const ctxRev = document.getElementById('revenueMarginChart').getContext('2d');
    revMarginChart = new Chart(ctxRev, {
        type: 'bar',
        data: getRevMarginData('baseline'),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Revenue ($B)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Operating Margin (%)' },
                    grid: { drawOnChartArea: false }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    const ctxCf = document.getElementById('cashFlowChart').getContext('2d');
    cfChart = new Chart(ctxCf, {
        type: 'line',
        data: getCashFlowData('baseline'),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { title: { display: true, text: '$ Billions' } }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function getRevMarginData(scenario) {
    const data = scenario === 'baseline' ? nvdiaData.baseline : nvdiaData.growthScenario;
    const labels = scenario === 'baseline' ? nvdiaData.labels : nvdiaData.growthScenario.labels;
    return {
        labels: labels,
        datasets: [
            {
                label: 'Revenue ($B)',
                data: data.revenue,
                backgroundColor: 'rgba(118, 185, 0, 0.6)',
                borderColor: 'rgba(118, 185, 0, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            },
            {
                label: 'Operating Margin (%)',
                data: data.operatingMargin,
                type: 'line',
                borderColor: '#1e88e5',
                backgroundColor: '#1e88e5',
                borderWidth: 2,
                tension: 0.3,
                yAxisID: 'y1'
            }
        ]
    };
}

function getCashFlowData(scenario) {
    const data = scenario === 'baseline' ? nvdiaData.baseline : nvdiaData.growthScenario;
    const labels = scenario === 'baseline' ? nvdiaData.labels : nvdiaData.growthScenario.labels;
    return {
        labels: labels,
        datasets: [
            {
                label: 'Free Cash Flow ($B)',
                data: data.cashFlow,
                borderColor: '#00897b',
                backgroundColor: 'rgba(0, 137, 123, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            },
            {
                label: 'CapEx ($B)',
                data: data.capEx,
                borderColor: '#ff4d4d',
                backgroundColor: 'rgba(255, 77, 77, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }
        ]
    };
}

function updateKPIs(scenario) {
    const data = scenario === 'baseline' ? nvdiaData.baseline : nvdiaData.growthScenario;
    
    // FY27 Index is 4
    const rev27 = data.revenue[4];
    const margin27 = data.operatingMargin[4];
    const fcf27 = data.cashFlow[4];
    const capex27 = data.capEx[4];

    kpiRevenue.innerText = formatCurr(rev27);
    kpiMargin.innerText = `${margin27.toFixed(1)}%`;
    kpiFcf.innerText = formatCurr(fcf27);
    kpiCapex.innerText = formatCurr(capex27);

    if (scenario === 'growth') {
        const revGrowth = ((rev27 / nvdiaData.baseline.revenue[4]) - 1) * 100;
        kpiRevenueTrend.innerText = `↑ ${revGrowth.toFixed(1)}% vs Baseline`;
        kpiRevenueTrend.className = 'kpi-trend positive';

        kpiMarginTrend.innerText = `↓ ${(margin27 - nvdiaData.baseline.operatingMargin[4]).toFixed(1)}% vs Baseline`;
        kpiMarginTrend.className = 'kpi-trend negative';

        const fcfGrowth = ((fcf27 / nvdiaData.baseline.cashFlow[4]) - 1) * 100;
        kpiFcfTrend.innerText = `↑ ${fcfGrowth.toFixed(1)}% vs Baseline`;
        kpiFcfTrend.className = 'kpi-trend positive';

        const capexGrowth = ((capex27 / nvdiaData.baseline.capEx[4]) - 1) * 100;
        kpiCapexTrend.innerText = `↑ ${capexGrowth.toFixed(1)}% vs Baseline`;
        kpiCapexTrend.className = 'kpi-trend negative';

        kpiNpv.innerText = formatCurr(Number(calculateNPV(0.1)));
        kpiIrr.innerText = `${calculateIRR()}%`;
    } else {
        kpiRevenueTrend.innerText = `Baseline Set`;
        kpiRevenueTrend.className = 'kpi-trend neutral';
        
        kpiMarginTrend.innerText = `Baseline Set`;
        kpiMarginTrend.className = 'kpi-trend neutral';

        kpiFcfTrend.innerText = `Baseline Set`;
        kpiFcfTrend.className = 'kpi-trend neutral';

        kpiCapexTrend.innerText = `Baseline Set`;
        kpiCapexTrend.className = 'kpi-trend neutral';

        kpiNpv.innerText = `$0.0B (Base)`;
        kpiIrr.innerText = `N/A`;
    }
}

// Event Listeners
scenarioToggle.addEventListener('change', (e) => {
    const scenario = e.target.checked ? 'growth' : 'baseline';
    
    // Update Charts
    revMarginChart.data = getRevMarginData(scenario);
    revMarginChart.update();
    
    cfChart.data = getCashFlowData(scenario);
    cfChart.update();

    // Update KPIs
    updateKPIs(scenario);
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    
    // Force the toggle to 'growth' scenario to match the initial KPI hardcoded HTML, 
    // or we can just call updateKPIs('baseline') if toggle is off.
    if(scenarioToggle.checked) {
        updateKPIs('growth');
    } else {
        // Let's default it to the 'growth' scenario as it's the main focus
        scenarioToggle.checked = true;
        updateKPIs('growth');
        revMarginChart.data = getRevMarginData('growth');
        revMarginChart.update();
        cfChart.data = getCashFlowData('growth');
        cfChart.update();
    }
});
