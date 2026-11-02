import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import prisma from '../prismaClient';

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response) {
    try {
      // Usamos o 'as' para garantir o tipo ao TypeScript
      const user = await userService.registerUser(req.body);
      res.status(201).json({ mensagem: "Utilizador criado com sucesso!", dados: user });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Chamamos o serviço que valida as credenciais e gera o Token
      const resultado = await userService.login(req.body);
      
      res.status(200).json({ 
        mensagem: "Login bem-sucedido!",
        dados: resultado // Aqui virá o token e os dados do user
      });
    } catch (error: any) {
      // Erro 401: Não autorizado (email ou password errados)
      res.status(401).json({ erro: error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await userService.getUserProfile(Number(req.params.id));
      res.json({ dados: user });
    } catch (error: any) {
      res.status(404).json({ erro: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = await userService.updateUser(Number(req.params.id), req.body);
      res.json({ mensagem: "Perfil atualizado!", dados: user });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }
}