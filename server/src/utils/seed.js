const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin
  const existingAdmin = await prisma.admin.findUnique({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const hash = await bcrypt.hash('peaky2024', 10);
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: hash,
        name: 'Administrador'
      }
    });
    console.log('✅ Admin criado: admin / peaky2024');
  } else {
    console.log('ℹ️  Admin já existe');
  }

  // Create guild bank
  const banco = await prisma.bancoGuilda.findFirst();
  if (!banco) {
    await prisma.bancoGuilda.create({ data: { saldo: 0 } });
    console.log('✅ Banco da Guilda criado');
  }

  // Create sample members
  const membros = [
    { nomeRP: 'Arthur Shelby', ouro: 1500 },
    { nomeRP: 'Tommy Shelby', ouro: 3200 },
    { nomeRP: 'Polly Gray', ouro: 800 },
  ];

  for (const m of membros) {
    const exists = await prisma.membro.findFirst({ where: { nomeRP: m.nomeRP } });
    if (!exists) {
      await prisma.membro.create({ data: m });
    }
  }
  console.log('✅ Membros de exemplo criados');
  console.log('\n🏴‍☠️ Banco de dados pronto!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
