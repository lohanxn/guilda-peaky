const prisma = require('../database/prisma');

const registrarHistorico = async ({
  membroId,
  adminId,
  operacao,
  quantidade,
  saldoAnterior,
  saldoNovo,
  motivo,
  referencia = null
}) => {
  return prisma.historico.create({
    data: {
      membroId: membroId || null,
      adminId,
      operacao,
      quantidade,
      saldoAnterior,
      saldoNovo,
      motivo,
      referencia
    }
  });
};

module.exports = { registrarHistorico };
