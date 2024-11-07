import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(config => {
    try {
        const sessionStr = localStorage.getItem('sb-vivzaeckjwicalmbbcpf-auth-token');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        }
        return config;
    } catch (error) {
        console.error('Erro ao processar token:', error);
        return config;
    }
}, error => {
    return Promise.reject(error);
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Opcional: Redirecionar para login ou atualizar token
            console.error('Erro de autenticação:', error);
        }
        return Promise.reject(error);
    }
);

export default api; 