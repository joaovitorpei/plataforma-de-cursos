/**
 * Promove um usuário a administrador.
 *
 *   npm run tornar-admin -- email@exemplo.com
 *
 * Existe por causa de um problema do ovo e da galinha: o cadastro pela API
 * sempre cria USER (senão qualquer pessoa viraria admin sozinha), e só um
 * ADMIN pode promover alguém. Então o **primeiro** administrador precisa
 * nascer fora da API — é o que este script faz, escrevendo direto no banco.
 *
 * Depois do primeiro, não precisa mais: um admin promove os outros pela tela.
 */

import { execFileSync } from 'node:child_process';

const email = process.argv[2];

if (!email) {
  console.error('Uso: npm run tornar-admin -- email@exemplo.com');
  process.exit(1);
}

// Aspas simples dentro do e-mail quebrariam o SQL. Não existe e-mail válido
// com aspas, mas é barato recusar em vez de confiar.
if (email.includes("'") || email.includes('\\')) {
  console.error('E-mail inválido.');
  process.exit(1);
}

const sql = `UPDATE "Usuarios" SET "Perfil" = 'ADMIN' WHERE "Email" = '${email}';`;

try {
  execFileSync('npx', ['prisma', 'db', 'execute', '--stdin'], {
    input: sql,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  console.log(`✓ ${email} agora é ADMIN`);
  console.log('  (se já estiver logado, saia e entre de novo: o perfil fica no token)');
} catch (erro) {
  console.error('Falhou:', erro.stderr?.toString() || erro.message);
  console.error('O banco está no ar? (docker compose up -d)');
  process.exit(1);
}
