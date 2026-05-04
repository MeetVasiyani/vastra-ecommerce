const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured.');
}

export const BACKEND_URL = trimTrailingSlash(apiUrl);
export const API_BASE_URL = `${BACKEND_URL}/api`;
