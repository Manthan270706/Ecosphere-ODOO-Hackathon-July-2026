

async function testApis() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('--- Testing EcoSphere APIs ---');

  try {
    // 1. Test Governance: Policies
    console.log('\n[1] Testing POST /governance/policies...');
    let res = await fetch(`${baseUrl}/governance/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Zero Waste 2026', content: 'We will reduce waste by 100%.', version: '1.0' })
    });
    const policy = await res.json();
    console.log('Response:', policy);

    console.log('\n[2] Testing GET /governance/policies...');
    res = await fetch(`${baseUrl}/governance/policies`);
    console.log('Response:', await res.json());

    // 2. Test Gamification: Rewards
    console.log('\n[3] Testing GET /gamification/rewards...');
    res = await fetch(`${baseUrl}/gamification/rewards`);
    console.log('Response:', await res.json());

    // 3. Test Gamification: Leaderboard
    console.log('\n[4] Testing GET /gamification/leaderboard...');
    res = await fetch(`${baseUrl}/gamification/leaderboard`);
    console.log('Response:', await res.json());

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testApis();
