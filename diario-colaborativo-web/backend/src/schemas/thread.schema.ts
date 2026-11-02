import { z } from 'zod';

export const createThreadSchema = z.object({
  body: z.object({
    titulo: z.string().min(3, "O título tem de ter pelo menos 3 caracteres."),
    descricao: z.string().optional(), // A descrição não é obrigatória
  })
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>['body'];

export const addMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID da thread inválido.")
  }),
  body: z.object({
    id_utilizador: z.number().positive("ID do utilizador é obrigatório."),
    cargo: z.enum(["ADMIN", "EDITOR", "LEITOR"]).default("LEITOR")
  })
});

export type AddMemberInput = z.infer<typeof addMemberSchema>['body'];

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID da thread inválido."),
    userId: z.string().regex(/^\d+$/, "ID do utilizador inválido.")
  })
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>['params'];
