import axios from 'axios';

// Cria uma instância do Axios com uma configuração base
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Adiciona o "porteiro" (Interceptor)
api.interceptors.request.use(async (config) => {
  // Pega o token
  const token = localStorage.getItem('token');

  // Se o token existir, anexa ele ao header de Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Retorna a configuração da requisição para que ela possa continuar
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;