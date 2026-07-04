const prisma = require('../database/prisma');

const listar = async (req, res) => {
  try {
    const { membroId, operacao, dataInicio, dataFim, page = 1, limit = 50 } = req.query;

    const where = {};
    if (membroId) where.membroId = Number(membroId);
    if (operacao) where.operacao = operacao;
    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt.gte = new Date(dataInicio);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        where.createdAt.lte = fim;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, historico] = await prisma.$transaction([
      prisma.historico.count({ where }),
      prisma.historico.findMany({
        where,
        include: {
          membro: { select: { id: true, nomeRP: true } },
          admin: { select: { id: true, name: true, username: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      })
    ]);

    res.json({ total, page: Number(page), limit: Number(limit), data: historico });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

const listarPorMembro = async (req, res) => {
  try {
    const historico = await prisma.historico.findMany({
      where: { membroId: Number(req.params.membroId), referencia: { not: 'banco' } },
      include: { admin: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico do membro' });
  }
};

module.exports = { listar, listarPorMembro };
