const axios = require('axios');

const API_BASE = 'http://20.207.122.201/evaluation-service';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaHJleWEuZXZhbEBhYmMuZWR1IiwiZXhwIjoxNzc4MDY1NTU2LCJpYXQiOjE3NzgwNjQ2NTYsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJiYjI4Mzg2MC03N2ZlLTRhNmYtYWRkNC0yYzk4MmM3YmFlMjgiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzaHJleWEiLCJzdWIiOiJlMWU2YTFjMi0zNDhkLTQ2M2ItODViMy1lYWRkMDg0ZDY0MDIifSwiZW1haWwiOiJzaHJleWEuZXZhbEBhYmMuZWR1IiwibmFtZSI6InNocmV5YSIsInJvbGxObyI6ImNiLnNjLnU0Y3NlMjMzNDciLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiJlMWU2YTFjMi0zNDhkLTQ2M2ItODViMy1lYWRkMDg0ZDY0MDIiLCJjbGllbnRTZWNyZXQiOiJERGNTVGN6akNicHh0a1pLIn0.V0yOP8nOD3PmA2YTdTo2QOV9d67AT-NPZbkaHIZjboY';

async function testToken() {
    const endpoints = ['/notifications', '/alerts', '/messages'];
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint}...`);
            const res = await axios.get(`${API_BASE}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`SUCCESS on ${endpoint}:`, res.data);
            return;
        } catch (err) {
            console.log(`Failed on ${endpoint}: ${err.message} (Status: ${err.response?.status})`);
        }
    }
}

testToken();
