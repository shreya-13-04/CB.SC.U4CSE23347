require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────
const BASE_URL = process.env.EVALUATION_API_BASE || 'http://20.207.122.281/evaluation-service';
const ACCESS_CODE = process.env.AUTH_TOKEN || 'PTBMmQ';

// Try multiple auth header formats
const headerVariants = [
  { 'Authorization': `Bearer ${ACCESS_CODE}` },
  { 'Authorization': ACCESS_CODE },
  { 'X-Access-Code': ACCESS_CODE },
  { 'x-api-key': ACCESS_CODE },
  { 'accesscode': ACCESS_CODE },
];

async function fetchWithFallback(url) {
  for (const headers of headerVariants) {
    try {
      const res = await axios.get(url, { headers, timeout: 8000 });
      console.log(`    Auth worked with: ${JSON.stringify(headers)}`);
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        console.log(`    Auth failed (${status}) with: ${JSON.stringify(headers)}`);
        continue;
      }
      
      throw err;
    }
  }
  throw new Error('All auth header variants failed');
}

// ── API Calls ────────────────────────────────────────────────
async function fetchDepots() {
  console.log(`    Calling: GET ${BASE_URL}/depots`);
  const data = await fetchWithFallback(`${BASE_URL}/depots`);
  return data.depots;
}

async function fetchVehicles() {
  console.log(`    Calling: GET ${BASE_URL}/vehicles`);
  const data = await fetchWithFallback(`${BASE_URL}/vehicles`);
  return data.vehicles;
}

// ── 0/1 Knapsack Algorithm ────────────────────────────────────
function knapsack(capacity, items) {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (Duration <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - Duration] + Impact);
      }
    }
  }

  const selectedTasks = [];
  let w = capacity;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedTasks.push(items[i - 1]);
      w -= items[i - 1].Duration;
    }
  }

  return {
    selectedTasks,
    totalImpact: dp[n][capacity],
    totalDuration: selectedTasks.reduce((sum, t) => sum + t.Duration, 0),
  };
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60));
  console.log('  Vehicle Maintenance Scheduler – Knapsack Optimizer');
  console.log(`  Access Code: ${ACCESS_CODE}`);
  console.log('='.repeat(60));

  let depots, vehicles;

  try {
    console.log('\n[1] Fetching depots from live API...');
    depots = await fetchDepots();
    console.log(`    Found ${depots.length} depots.`);

    console.log('[2] Fetching vehicles from live API...');
    vehicles = await fetchVehicles();
    console.log(`    Found ${vehicles.length} tasks.\n`);

  } catch (err) {
    console.error('\n[ERROR] Could not reach evaluation API:', err.message);
    console.log('[DEMO MODE] Using sample data from document...\n');

    depots = [
      { ID: 1, MechanicHours: 60 },
      { ID: 2, MechanicHours: 135 },
      { ID: 3, MechanicHours: 188 },
      { ID: 4, MechanicHours: 97 },
      { ID: 5, MechanicHours: 164 },
    ];

    vehicles = [
      { TaskID: '264e638f-1c7a-4d67-9f9c-53f3d1768d37', Duration: 1, Impact: 5 },
      { TaskID: '73ce8dca-1536-4a7a-9f1a-c67883afad61', Duration: 6, Impact: 2 },
      { TaskID: '4b6e22ee-b4ed-45a6-a8af-5294b0d09f37', Duration: 3, Impact: 3 },
      { TaskID: 'd6372f32-852b-46a9-8e8c-e730fecc3c22', Duration: 3, Impact: 5 },
      { TaskID: 'ec40b581-bdfc-43e8-a847-871fdafe8167', Duration: 7, Impact: 3 },
      { TaskID: 'fb1e3165-67c9-4e96-a5c3-2d20085d293b', Duration: 3, Impact: 3 },
      { TaskID: '730065c0-3815-4d10-818a-b93b117a30d8', Duration: 5, Impact: 1 },
      { TaskID: '72a91abc-4ed7-402c-9e99-348e7437953b', Duration: 5, Impact: 9 },
      { TaskID: '8a7ff5b1-335c-4a2f-96d8-05c4a362a781', Duration: 6, Impact: 10 },
    ];
  }

  const results = [];

  console.log('='.repeat(60));
  for (const depot of depots) {
    const { selectedTasks, totalImpact, totalDuration } = knapsack(depot.MechanicHours, vehicles);
    const result = {
      depotId: depot.ID,
      mechanicHoursBudget: depot.MechanicHours,
      totalTasksAvailable: vehicles.length,
      tasksSelected: selectedTasks.length,
      totalDurationUsed: totalDuration,
      totalImpactScore: totalImpact,
      efficiency: ((totalDuration / depot.MechanicHours) * 100).toFixed(1) + '%',
      selectedTasks: selectedTasks.map(t => ({ TaskID: t.TaskID, Duration: t.Duration, Impact: t.Impact })),
    };
    results.push(result);

    console.log(`\nDepot ${depot.ID}  (Budget: ${depot.MechanicHours}h)`);
    console.log(`  Tasks Selected : ${selectedTasks.length} / ${vehicles.length}`);
    console.log(`  Hours Used     : ${totalDuration} / ${depot.MechanicHours}`);
    console.log(`  Total Impact   : ${totalImpact}`);
    console.log(`  Efficiency     : ${result.efficiency}`);
    selectedTasks.forEach(t =>
      console.log(`    ▸ [${t.TaskID}]  ${t.Duration}h  impact:${t.Impact}`)
    );
  }

  const totalImpact = results.reduce((s, r) => s + r.totalImpactScore, 0);
  console.log('\n' + '='.repeat(60));
  console.log(`  Total Impact across all depots: ${totalImpact}`);
  console.log('='.repeat(60));

  // Save output to file for screenshot submission
  const outputPath = path.join(__dirname, 'output.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n Results saved to: ${outputPath}`);

  return results;
}

main().catch(console.error);
