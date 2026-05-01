const axios = require('axios');

const BACKEND_URL = 'http://localhost:5121';
const API_BASE_URL = `${BACKEND_URL}/api`;

async function repro() {
    try {
        console.log('Logging in...');
        const loginResponse = await axios.post(`${API_BASE_URL}/Auth/login`, {
            email: 'admin@vastra.com',
            password: 'Admin@123'
        });

        const token = loginResponse.data.token;
        console.log('Login successful. Token:', token.substring(0, 20) + '...');

        const couponData = {
            code: 'SAVE20',
            discountAmount: 0,
            discountPercentage: 20,
            expirationDate: new Date('2026-03-14').toISOString(),
            minimumOrderAmount: 0
        };

        console.log('Attempting to create coupon:', couponData);
        const response = await axios.post(`${API_BASE_URL}/Coupon`, couponData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Success!', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
}

repro();
