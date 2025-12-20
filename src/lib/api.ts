export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'; 

export const getMediaUrl = (path: string | null) => {
    if (!path) return '/images/hero_backround.jpg';
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
    // Remove /api from API_URL to get target root
    const baseUrl = API_URL.replace(/\/api$/, '');
    return `${baseUrl}/${path}`;
};

interface FetchOptions extends RequestInit {
    token?: string;
}

export const api = {
    get: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        const token = options.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            method: 'GET',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${res.statusText}`);
        }

        return res.json();
    },

    post: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
        const isFormData = body instanceof FormData;
        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string> || {}),
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const token = options.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${res.statusText}`);
        }

        return res.json();
    },

    put: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
        const isFormData = body instanceof FormData;
        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string> || {}),
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const token = options.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            method: 'PUT',
            body: isFormData ? body : JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${res.statusText}`);
        }

        return res.json();
    },

    delete: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        const token = options.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${res.statusText}`);
        }

        return res.json();
    },

    upload: async <T>(endpoint: string, formData: FormData, options: FetchOptions = {}): Promise<T> => {
        return api.post<T>(endpoint, formData, options);
    }
};
