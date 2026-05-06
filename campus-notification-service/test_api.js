const axios = require('axios');

const API_BASE = 'http://20.207.122.201/evaluation-service';
const token = 'PTBMmQ';

async function testSeeding() {
    const endpoints = ['/notifications', '/alerts', '/messages'];
    const headerVariants = [
        { 'Authorization': `Bearer ${token}` },
        { 'Authorization': token },
        { 'X-Access-Code': token },
        { 'x-api-key': token },
        { 'accesscode': token },
    ];

    for (const endpoint of endpoints) {
        const url = `${API_BASE}${endpoint}`;
        for (const headers of headerVariants) {
            try {
                console.log(`Testing ${url} with ${JSON.stringify(headers)}...`);
                const res = await axios.get(url, { headers, timeout: 3000 });
                console.log(`SUCCESS! ${url} returned data.`);
                console.log(JSON.stringify(res.data, null, 2).substring(0, 500));
                return;
            } catch (err) {
                console.log(`Failed: ${err.message} (Status: ${err.response?.status})`);
            }
        }
    }
}

testSeeding();
