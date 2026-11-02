import { z } from 'zod';

export const createMemorySchema = z.object({
  // O ID da thread vem do URL
  params: z.object({
    id: z.string().regex(/^\d+$/, "O ID da thread tem de ser um número.")
  }),
  // O resto vem no corpo do pedido
  body: z.object({
    texto: z.string().optional(),
    media_url: z.string().url("A URL do ficheiro multimédia é inválida.").optional(),
    tags: z.array(z.string()).optional() // Uma lista de palavras (tags)
  }).refine(data => data.texto || data.media_url, {
    message: "A memória tem de ter pelo menos texto ou um ficheiro multimédia (media_url)."
  })
});

export type CreateMemoryBody = z.infer<typeof createMemorySchema>['body'];

export const deleteMemorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID da memória inválido.")
  })
});

