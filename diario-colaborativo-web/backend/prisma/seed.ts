import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 A semear a base de dados com contas de teste...');

  // Encriptar a password usando a mesma biblioteca da tua API
  const hashedPassword = await bcrypt.hash('SenhaForte123!', 10);

  // Usamos upsert para evitar erros caso o seed seja executado duas vezes
  const admin = await prisma.user.upsert({
    where: { email: 'professor@lifethreads.pt' },
    update: {},
    create: {
      nome: 'Professor Avaliador',
      email: 'professor@lifethreads.pt',
      password_hash: hashedPassword,
      // role: 'ADMIN' // <-- Descomenta se adicionaste 'role' no esquema Prisma como pedia o TP7
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'aluno@lifethreads.pt' },
    update: {},
    create: {
      nome: 'Aluno ASW',
      email: 'aluno@lifethreads.pt',
      password_hash: hashedPassword,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`Credenciais geradas:
  Email: ${admin.email} | Password: SenhaForte123!
  Email: ${user.email}  | Password: SenhaForte123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });