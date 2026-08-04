export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api' || 'https://yogyakarta-gn-vercel-git-main-haav.vercel.app/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
