const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('bg_token');
}

function getHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

export async function api(endpoint, options = {}) {
    const { method = 'GET', body, ...rest } = options;

    const config = {
        method,
        headers: getHeaders(),
        ...rest
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

export async function login(username, password) {
    const data = await api('/auth/login', {
        method: 'POST',
        body: { username, password }
    });
    localStorage.setItem('bg_token', data.token);
    localStorage.setItem('bg_user', JSON.stringify(data.user));
    return data;
}

export function logout() {
    localStorage.removeItem('bg_token');
    localStorage.removeItem('bg_user');
    window.location.href = '/';
}

export function getCurrentUser() {
    const user = localStorage.getItem('bg_user');
    return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
    return !!getToken();
}
