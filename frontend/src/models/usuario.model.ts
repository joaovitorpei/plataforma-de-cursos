import { z } from 'zod';

/** Tipo de conta. USER é aluno; ADMIN é professor/administrador. */
export const PERFIS = ['USER', 'ADMIN'] as const;
export type Perfil = (typeof PERFIS)[number];

export const ROTULO_PERFIL: Record<Perfil, string> = {
  USER: 'Aluno',
  ADMIN: 'Professor',
};

/** Tabela Usuarios. A senha nunca volta nas respostas da API. */
export interface IUsuario {
  idUsuario: number;
  nomeCompleto: string;
  email: string;
  perfil: Perfil;
  dataCadastro: string;
}

export const usuarioSchema = z.object({
  nomeCompleto: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.email('Digite um e-mail válido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  perfil: z.enum(PERFIS).optional(),
});

export type UsuarioEntrada = z.infer<typeof usuarioSchema>;

/** Na edição a senha é opcional: em branco significa "manter a atual". */
export const usuarioEdicaoSchema = usuarioSchema.extend({
  senha: z
    .string()
    .refine(
      (v) => v === '' || v.length >= 6,
      'A senha deve ter no mínimo 6 caracteres',
    ),
});
