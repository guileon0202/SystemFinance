// arquivo: backend/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'seu_segredo_super_forte';

function authMiddleware(req, res, next) {
  // 1. Pega o token do header 'Authorization' da requisição
  const authHeader = req.headers.authorization;

  // 2. Verifica se o token existe
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido. Acesso negado.' });
  }

  // O token vem no formato "Bearer [token]". Vamos separar as duas partes.
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado.' });
  }

  // 3. Verifica se o token é válido
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    // 4. Se for válido, anexa o ID do usuário à requisição
    // O 'decoded.userId' vem do que salvamos quando criamos o token no login/registro
    req.userId = decoded.userId;

    // 5. Chama a próxima função (o controller) para continuar o processo
    return next();
  });
}

module.exports = authMiddleware;