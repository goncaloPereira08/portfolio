import { getJwtSecret } from '../utils/jwtSecret';
import prisma from '../prismaClient';
import { RegisterUserInput, LoginInput } from '../schemas/user.schema';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; 

const SALT_ROUNDS = 10;

export class UserService {
  
  async registerUser(data: RegisterUserInput) {
    // Verificar se o utilizador já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error("Já existe um utilizador com este email.");
    }

    // Hashing seguro da password com bcrypt
    const hash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Criar o utilizador na base de dados (repara no password_hash)
    const newUser = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        password_hash: hash,
      }
    });

    // Retornar os dados do novo utilizador (sem a password!)
    return {
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      criado_em: newUser.criado_em
    };
  }

  // Buscar perfil com as suas threads
  async getUserProfile(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        threadsCriadas: true,
      }
    });
    if (!user) throw new Error("Utilizador não encontrado.");
    const { password_hash, ...userWithoutPassword } = user; // Segurança: remover a password
    return userWithoutPassword;
  }

  // Atualizar dados (Nome/Email)
  async updateUser(id: number, data: { nome?: string; email?: string }) {
    return await prisma.user.update({
      where: { id },
      data: data,
      select: { id: true, nome: true, email: true }
    });
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) throw new Error("Credenciais inválidas.");

    // Comparar a password usando o bcrypt
    const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatch) throw new Error("Credenciais inválidas.");

    // Gerar o token
    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    return { token, user: { id: user.id, nome: user.nome, email: user.email } };
  }
}