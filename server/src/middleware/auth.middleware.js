const jwt = require('jsonwebtoken');
const prisma = require('../database/prisma');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });

    if (!admin) {
      return res.status(401).json({ error: 'Administrador não encontrado' });
    }

    req.admin = { id: admin.id, username: admin.username, name: admin.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = { authenticate };
