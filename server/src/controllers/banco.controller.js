const prisma = require('../database/prisma');
const { registrarHistorico } = require('../services/historico.service');

const getBanco = async (req, res) => {
  try {
    let banco = await prisma.bancoGuilda.findFirst();
    if (!banco) {
      banco = await prisma.bancoGuilda.create({ data: { saldo: 0 } });
    }
    res.json(banco);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar banco' });
  }
};

// Banco deposita ouro para membro (banco perde, membro ganha)
const bancoParaMembro = async (req, res) => {
  const { membroId, quantidade, motivo } = req.body;
  const qtd = Number(quantidade);

  if (!membroId || !qtd || !motivo) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  try {
    let banco = await prisma.bancoGuilda.findFirst();
    if (!banco) banco = await prisma.bancoGuilda.create({ data: { saldo: 0 } });

    if (banco.saldo < qtd) {
      return res.status(400).json({ error: 'Saldo insuficiente no banco' });
    }

    const membro = await prisma.membro.findUnique({ where: { id: Number(membroId) } });
    if (!membro) return res.status(404).json({ error: 'Membro não encontrado' });

    const saldoAnteriorBanco = banco.saldo;
    const saldoAnteriorMembro = membro.ouro;

    const [bancoAtualizado, membroAtualizado] = await prisma.$transaction([
      prisma.bancoGuilda.update({
        where: { id: banco.id },
        data: { saldo: banco.saldo - qtd }
      }),
      prisma.membro.update({
        where: { id: Number(membroId) },
        data: { ouro: membro.ouro + qtd }
      })
    ]);

    await registrarHistorico({
      membroId: Number(membroId),
      adminId: req.admin.id,
      operacao: 'SAQUE',
      quantidade: qtd,
      saldoAnterior: saldoAnteriorBanco,
      saldoNovo: bancoAtualizado.saldo,
      motivo,
      referencia: 'banco'
    });

    await registrarHistorico({
      membroId: Number(membroId),
      adminId: req.admin.id,
      operacao: 'ADD',
      quantidade: qtd,
      saldoAnterior: saldoAnteriorMembro,
      saldoNovo: membroAtualizado.ouro,
      motivo: `Recebido do banco: ${motivo}`,
      referencia: 'membro'
    });

    res.json({ banco: bancoAtualizado, membro: membroAtualizado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro na transferência' });
  }
};

// Membro deposita ouro para o banco (membro perde, banco ganha)
const membroParaBanco = async (req, res) => {
  const { membroId, quantidade, motivo } = req.body;
  const qtd = Number(quantidade);

  if (!membroId || !qtd || !motivo) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  try {
    let banco = await prisma.bancoGuilda.findFirst();
    if (!banco) banco = await prisma.bancoGuilda.create({ data: { saldo: 0 } });

    const membro = await prisma.membro.findUnique({ where: { id: Number(membroId) } });
    if (!membro) return res.status(404).json({ error: 'Membro não encontrado' });

    if (membro.ouro < qtd) {
      return res.status(400).json({ error: 'Membro não possui ouro suficiente' });
    }

    const saldoAnteriorBanco = banco.saldo;
    const saldoAnteriorMembro = membro.ouro;

    const [bancoAtualizado, membroAtualizado] = await prisma.$transaction([
      prisma.bancoGuilda.update({
        where: { id: banco.id },
        data: { saldo: banco.saldo + qtd }
      }),
      prisma.membro.update({
        where: { id: Number(membroId) },
        data: { ouro: membro.ouro - qtd }
      })
    ]);

    await registrarHistorico({
      membroId: Number(membroId),
      adminId: req.admin.id,
      operacao: 'DEPOSITO',
      quantidade: qtd,
      saldoAnterior: saldoAnteriorBanco,
      saldoNovo: bancoAtualizado.saldo,
      motivo,
      referencia: 'banco'
    });

    await registrarHistorico({
      membroId: Number(membroId),
      adminId: req.admin.id,
      operacao: 'REMOVE',
      quantidade: qtd,
      saldoAnterior: saldoAnteriorMembro,
      saldoNovo: membroAtualizado.ouro,
      motivo: `Depositado no banco: ${motivo}`,
      referencia: 'membro'
    });

    res.json({ banco: bancoAtualizado, membro: membroAtualizado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro na transferência' });
  }
};

const getHistoricoBanco = async (req, res) => {
  try {
    const historico = await prisma.historico.findMany({
      where: { referencia: 'banco' },
      include: { membro: true, admin: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico do banco' });
  }
};

module.exports = { getBanco, bancoParaMembro, membroParaBanco, getHistoricoBanco };
