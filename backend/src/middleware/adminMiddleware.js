const db = require('../db/db');

async function adminMiddleware(req, res, next) {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Acesso negado. Token inválido.' });
  }

  try {
    // 1. Busca o usuário no banco de dados para checar sua permissão
    const userResult = await db.query('SELECT is_admin FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = userResult.rows[0];

    // 2. Verifica se o usuário tem o "crachá" de admin
    if (!user.is_admin) {
      return res.status(403).json({ message: 'Acesso negado. Esta ação é permitida apenas para administradores.' });
    }

    // 3. Se for admin, permite que a requisição continue
    next();

  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

module.exports = adminMiddleware;