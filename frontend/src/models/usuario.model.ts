import { z } from 'zod';

/** Tipo de conta na plataforma. */
export const PERFIS = ['USER', 'INSTRUTOR', 'ADMIN'] as const;
export type Perfil = (typeof PERFIS)[number];

export const ROTULO_PERFIL: Record<Perfil, string> = {
  USER: 'Aluno',
  INSTRUTOR: 'Professor',
  ADMIN: 'Administrador',
};

/** O que cada perfil faz, para explicar a escolha na tela. */
export const DESCRICAO_PERFIL: Record<Perfil, string> = {
  USER: 'Estuda: vê o catálogo, se matricula e acompanha o próprio progresso.',
  INSTRUTOR:
    'Ensina: cria cursos, módulos e aulas, e acompanha os alunos. Não mexe no financeiro.',
  ADMIN:
    'Dono da plataforma: tudo, inclusive planos e pagamentos, e cria as contas da equipe.',
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
});

export type UsuarioEntrada = z.infer<typeof usuarioSchema>;

/** Na edição a senha é opcional: em branco significa "manter a atual". */
export const usuarioEdicaoSchema = usuarioSchema.extend({
  perfil: z.enum(PERFIS),
  senha: z
    .string()
    .refine(
      (v) => v === '' || v.length >= 6,
      'A senha deve ter no mínimo 6 caracteres',
    ),
});
