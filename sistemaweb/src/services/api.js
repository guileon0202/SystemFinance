import axios from 'axios';

const api = axios.create({
  // Esta linha diz ao Axios para enviar TODAS as requisições
  // para o seu servidor Backend que está rodando na porta 3333.
  baseURL: 'http://localhost:3000',
});

export default api;