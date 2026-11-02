import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  
  // Constrói o objeto de resposta final
  const resposta: any = {
    success: false,
    status: statusCode,
    error: err.message || 'Erro interno do servidor.',
    // Garante que a propriedade existe sempre! Se não houver detalhes, manda um array vazio.
    detalhes: err.detalhes || [], 
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json(resposta);
};