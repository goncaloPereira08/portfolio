import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Mantemos a tua estrutura original que suportava body, query e params!
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next(); 
    } catch (error: any) {
      // Cria o erro personalizado e passa para o errorHandler
      const customError = new Error('Erro de Validação (Zod)');
      (customError as any).status = 400;
      // Garante que apanha os erros do Zod (seja no formato errors ou issues)
      (customError as any).detalhes = error.errors || error.issues || []; 
      return next(customError);
    }
};