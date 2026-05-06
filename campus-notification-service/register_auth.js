const axios = require('axios');
const fs = require('fs');
const path = require('path');

const config = {
    email: 'shreyabaala2004@gmail.com', 
    name: 'Shreya',
    rollNo: 'CB.SC.U4CSE23347',
    githubUsername: 'shreya-13-04',
    mobileNo: '6369250928',
    accessCode: 'PTBMmQ'
};

const API_BASE = 'http://20.207.122.201/evaluation-service';

async function register() {
    console.log('--- Registration ---');
    try {
        const response = await axios.post(`${API_BASE}/register`, config);
        console.log('Registration Success:', response.data);
        return response.data;
    } catch (error) {
        console.error('Registration Error:', error.response ? error.response.data : error.message);
        
    }
}

async function authenticate(credentials) {
    console.log('\n--- Authentication ---');
    try {
        const authPayload = {
            ...config,
            clientID: credentials.clientID,
            clientSecret: credentials.clientSecret
        };
        const response = await axios.post(`${API_BASE}/auth`, authPayload);
        console.log('Auth Success:', response.data);
        return response.data;
    } catch (error) {
        console.error('Auth Error:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function run() {
    const regData = await register();
    if (regData && regData.clientID) {
        const authData = await authenticate(regData);
        if (authData && authData.access_token) {
            console.log('\n--- Final Token ---');
            console.log('ACCESS_TOKEN:', authData.access_token);
            
            // Save to a file for later use
            const result = {
                ...regData,
                ...authData
            };
            fs.writeFileSync(path.join(__dirname, 'credentials.json'), JSON.stringify(result, null, 2));
            console.log('\nCredentials saved to credentials.json');
        }
    } else {
        console.log('\nRegistration did not return credentials. If already registered, use existing clientID/Secret.');
    }
}

run();
