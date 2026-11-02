import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    nome: z.string().min(2, "O nome tem de ter pelo menos 2 caracteres."),
    email: z.string().email("Formato de email inválido."),
    password: z.string().min(6, "A password tem de ter pelo menos 6 caracteres.")
  })
});

// Tipo gerado a partir do schema para podermos usar noutros ficheiros
export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Formato de email inválido."),
    password: z.string().min(6, "A password tem de ter pelo menos 6 caracteres.")
  })
});

export type LoginInput = z.infer<typeof loginSchema>['body'];

// Para atualizar dados do utilizador (nome/email)
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID do utilizador inválido.")
  }),
  body: z.object({
    nome: z.string().min(2, "O nome tem de ter pelo menos 2 caracteres.").optional(),
    email: z.string().email("Formato de email inválido.").optional()
  }).refine(data => data.nome || data.email, {
    message: "Tem de fornecer pelo menos um campo para atualizar (nome ou email)."
  })
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];