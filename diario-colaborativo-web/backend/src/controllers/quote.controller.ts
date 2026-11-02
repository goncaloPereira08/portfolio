import { Request, Response } from 'express';
import { QuoteService } from '../services/quote.service';

const quoteService = new QuoteService();

export class QuoteController {
  getRandom = async (req: Request, res: Response) => {
    try {
      const quote = await quoteService.getRandomQuote();
      res.status(200).json(quote);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao obter citação externa." });
    }
  };
}