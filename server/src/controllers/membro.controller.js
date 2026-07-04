const prisma = require('../database/prisma');
const { registrarHistorico } = require('../services/historico.service');

const listar = async (req, res) => {
  try {
    const { search } = req.query;
    const where = { ativo: true };
    if (search) {
      where.nomeRP = { contains: search };
    }
    const membros = await prisma.membro.findMany({
      where,
      orderBy: { ouro: 'desc' }
    });
    res.json(membros);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar membros' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const membro = await prisma.membro.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!membro) return res.status(404).json({ error: 'Membro não encontrado' });
    res.json(membro);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar membro' });
  }
};

const criar = async (req, res) => {
  const { nomeRP, ouro = 0, observacoes } = req.body;

  if (!nomeRP) return res.status(400).json({ error: 'Nome RP é obrigatório' });

  try {
    const membro = await prisma.membro.create({
      data: { nomeRP, ouro: Number(ouro), observacoes }
    });

    if (ouro > 0) {
      await registrarHistorico({
        membroId: membro.id,
        adminId: req.admin.id,
        operacao: 'ADD',
        quantidade: Number(ouro),
        saldoAnterior: 0,
        saldoNovo: Number(ouro),
        motivo: 'Saldo inicial de cadastro'
      });
    }

    res.status(201).json(membro);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar membro' });
  }
};

const atualizar = async (req, res) => {
  const { nomeRP, observacoes } = req.body;
  try {
    const membro = await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: { nomeRP, observacoes }
    });
    res.json(membro);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar membro' });
  }
};

const excluir = async (req, res) => {
  try {
    await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: { ativo: false }
    });
    res.json({ message: 'Membro removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir membro' });
  }
};

const operacaoOuro = async (req, res) => {
  const { operacao, quantidade, motivo } = req.body;
  const membroId = Number(req.params.id);

  if (!operacao || !quantidade || !motivo) {
    return res.status(400).json({ error: 'Operação, quantidade e motivo são obrigatórios' });
  }

  const qtd = Number(quantidade);
  if (qtd <= 0) return res.status(400).json({ error: 'Quantidade deve ser positiva' });

  try {
    const membro = await prisma.membro.findUnique({ where: { id: membroId } });
    if (!membro) return res.status(404).json({ error: 'Membro não encontrado' });

    const saldoAnterior = membro.ouro;
    let saldoNovo;

    if (operacao === 'ADD') saldoNovo = saldoAnterior + qtd;
    else if (operacao === 'REMOVE') {
      saldoNovo = saldoAnterior - qtd;
      if (saldoNovo < 0) return res.status(400).json({ error: 'Saldo insuficiente' });
    } else if (operacao === 'SET') {
      saldoNovo = qtd;
    } else {
      return res.status(400).json({ error: 'Operação inválida' });
    }

    const membroAtualizado = await prisma.membro.update({
      where: { id: membroId },
      data: { ouro: saldoNovo }
    });

    await registrarHistorico({
      membroId,
      adminId: req.admin.id,
      operacao,
      quantidade: qtd,
      saldoAnterior,
      saldoNovo,
      motivo
    });

    res.json(membroAtualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao realizar operação de ouro' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir, operacaoOuro };
