/**
 * Cria (ou restaura) a conta de administrador da plataforma.
 *
 *   npm run admin-inicial
 *
 * Existe por causa de um problema do ovo e da galinha: o cadastro público
 * sempre cria ALUNO, e só um ADMIN pode criar outras contas de ADMIN ou de
 * professor. Então o **primeiro** administrador precisa nascer fora da API.
 *
 * Depois dele, não precisa mais deste script: o admin cria os professores e os
 * alunos pela tela de Usuários.
 *
 * Roda direto no banco, então a API nem precisa estar no ar — só o Postgres.
 */

import { execFileSync } from 'node:child_process';
import bcrypt from 'bcrypt';

const ADMIN = {
  nome: 'João Vitor Peixoto',
  email: 'joaovitor@gmail.com',
  senha: 'senha123',
};

const hash = await bcrypt.hash(ADMIN.senha, 10);

// Se já existir o e-mail, garante que ele é ADMIN e atualiza nome e senha.
// Assim o script pode ser rodado de novo sem dar erro de e-mail duplicado.
const sql = `
INSERT INTO "Usuarios" ("NomeCompleto", "Email", "SenhaHash", "Perfil", "DataCadastro")
VALUES ('${ADMIN.nome}', '${ADMIN.email}', '${hash}', 'ADMIN', CURRENT_DATE)
ON CONFLICT ("Email") DO UPDATE
SET "NomeCompleto" = EXCLUDED."NomeCompleto",
    "SenhaHash"    = EXCLUDED."SenhaHash",
    "Perfil"       = 'ADMIN';
`;

try {
  execFileSync('npx', ['prisma', 'db', 'execute', '--stdin'], {
    input: sql,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  console.log('✓ Administrador pronto\n');
  console.log(`  nome   ${ADMIN.nome}`);
  console.log(`  e-mail ${ADMIN.email}`);
  console.log(`  senha  ${ADMIN.senha}`);
  console.log('\n  Entre pela aba "Administrador" na tela de login.');
} catch (erro) {
  console.error('Falhou:', erro.stderr?.toString() || erro.message);
  console.error('\nO banco está no ar? Rode: docker compose up -d');
  process.exit(1);
}
