import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import prisma from '../prismaClient';

export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateSummary(memories: any[]): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = "Age como um observador. Resume as memórias e imagens fornecidas abaixo numa frase curta e com impacto. Não escrevas textos longos, introduções nem parágrafos completos.";
    
    const parts: any[] = [{ text: prompt }];

    for (const m of memories) {
      if (m.texto) parts.push({ text: `\nRegisto: ${m.texto}` });

      if (m.tipo_anexo === 'imagem' && m.anexo_url) {
          const fileName = m.anexo_url.split('/').pop();
          const filePath = path.join(process.cwd(), 'uploads', fileName || '');
          
          if (fs.existsSync(filePath)) {
              const imageBase64 = fs.readFileSync(filePath).toString("base64");
              parts.push({
                  inlineData: { data: imageBase64, mimeType: "image/jpeg" }
              });
          }
      }
    }

    const result = await model.generateContent(parts);
    return result.response.text();
  }
}