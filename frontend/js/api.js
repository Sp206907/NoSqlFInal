// API Configuration
const API_URL = 'http://localhost:5000/api';

// API Helper Functions
const api = {
    // Auth endpoints
    async register(username, email, password) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        return await response.json();
    },

    async login(username, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        return await response.json();
    },

    // Account endpoints
    async getAccounts() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/accounts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    },

    async createAccount(name, type, balance) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, type, balance })
        });
        return await response.json();
    },

    async updateAccount(id, data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/accounts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async deleteAccount(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/accounts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    },

    // Transaction endpoints
    async getTransactions(filters = {}) {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/transactions?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    },

    async createTransaction(data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async updateTransaction(id, data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async deleteTransaction(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    },

    async getStatistics(startDate, endDate) {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ startDate, endDate }).toString();
        const response = await fetch(`${API_URL}/transactions/statistics?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }
};
