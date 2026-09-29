import { z } from 'zod';

/** Tabela Usuarios. A senha nunca volta nas respostas da API. */
export interface IUsuario {
  idUsuario: number;
  nomeCompleto: string;
  email: string;
  dataCadastro: string;
}

export const usuarioSchema = z.object({
  nomeCompleto: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.email('Digite um e-mail válido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export type UsuarioEntrada = z.infer<typeof usuarioSchema>;

/** Na edição a senha é opcional: em branco significa "manter a atual". */
export const usuarioEdicaoSchema = usuarioSchema.extend({
  senha: z
    .string()
    .refine((v) => v === '' || v.length >= 6, 'A senha deve ter no mínimo 6 caracteres'),
});
