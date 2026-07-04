const prisma = require('../database/prisma');

const getDashboard = async (req, res) => {
  try {
    const [totalMembros, membros, banco, ultimaMovimentacao] = await Promise.all([
      prisma.membro.count({ where: { ativo: true } }),
      prisma.membro.findMany({ where: { ativo: true }, select: { ouro: true, nomeRP: true } }),
      prisma.bancoGuilda.findFirst(),
      prisma.historico.findFirst({ orderBy: { createdAt: 'desc' } })
    ]);

    const ouroTotal = membros.reduce((acc, m) => acc + m.ouro, 0);

    const ranking = await prisma.membro.findMany({
      where: { ativo: true },
      select: { id: true, nomeRP: true, ouro: true },
      orderBy: { ouro: 'desc' },
      take: 10
    });

    res.json({
      totalMembros,
      ouroTotal,
      banceSaldo: banco?.saldo || 0,
      ultimaMovimentacao: ultimaMovimentacao?.createdAt || null,
      ranking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
};

const getEstatisticas = async (req, res) => {
  try {
    // Movimentações por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const historico = await prisma.historico.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        referencia: { not: 'banco' }
      },
      select: { createdAt: true, operacao: true, quantidade: true }
    });

    // Agrupar por mês
    const meses = {};
    historico.forEach(h => {
      const key = `${h.createdAt.getFullYear()}-${String(h.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!meses[key]) meses[key] = { mes: key, entradas: 0, saidas: 0, total: 0 };
      if (['ADD', 'DEPOSITO'].includes(h.operacao)) {
        meses[key].entradas += h.quantidade;
      } else if (['REMOVE', 'SAQUE'].includes(h.operacao)) {
        meses[key].saidas += h.quantidade;
      }
    });

    const movimentacoesMes = Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes));

    // Evolução do ouro total (saldo atual dos membros)
    const membros = await prisma.membro.findMany({
      where: { ativo: true },
      select: { ouro: true }
    });
    const ouroTotal = membros.reduce((acc, m) => acc + m.ouro, 0);

    res.json({ movimentacoesMes, ouroTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

module.exports = { getDashboard, getEstatisticas };
