/**
 * Popula a plataforma com dados de demonstração, pela própria API.
 *
 *   npm run dados-exemplo
 *
 * Precisa da API no ar (npm run start:dev). O script cria um usuário
 * administrador, faz login e usa o token nas rotas protegidas — ou seja,
 * percorre exatamente o mesmo caminho que o frontend.
 */

import { execFileSync } from 'node:child_process';

const API = process.env.API_URL ?? 'http://localhost:3000';
const ADMIN = {
  nomeCompleto: 'Administrador EduCursos',
  email: 'admin@educursos.com',
  senha: 'senha123',
};

let token = null;

async function chamar(caminho, metodo = 'GET', corpo) {
  const resposta = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    const erro = new Error(dados?.message ?? `HTTP ${resposta.status}`);
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

/** Cria o registro; se já existir (409), segue em frente. */
async function criar(rotulo, caminho, corpo) {
  try {
    const criado = await chamar(caminho, 'POST', corpo);
    console.log(`  + ${rotulo}`);
    return criado;
  } catch (erro) {
    if (erro.status === 409) {
      console.log(`  = ${rotulo} (já existia)`);
      return null;
    }
    throw erro;
  }
}

async function main() {
  console.log(`Populando ${API}\n`);

  // -------- usuário administrador + login --------
  console.log('Usuários');
  await criar('admin@educursos.com', '/usuarios', ADMIN);

  // O cadastro pela API sempre cria USER. O primeiro administrador precisa
  // ser promovido direto no banco — depois dele, um admin promove os outros.
  execFileSync('node', ['scripts/tornar-admin.mjs', ADMIN.email], {
    stdio: 'inherit',
  });

  ({ access_token: token } = await chamar('/auth/login', 'POST', {
    email: ADMIN.email,
    senha: ADMIN.senha,
  }));
  console.log('  ✓ autenticado como ADMIN\n');

  const alunos = [];
  for (const [nome, email] of [
    ['Ana Souza', 'ana@educursos.com'],
    ['Bruno Lima', 'bruno@educursos.com'],
    ['Carla Dias', 'carla@educursos.com'],
  ]) {
    await criar(email, '/usuarios', { nomeCompleto: nome, email, senha: 'senha123' });
    alunos.push(email);
  }

  const usuarios = await chamar('/usuarios');
  const porEmail = (email) => usuarios.find((u) => u.email === email);
  const instrutor = porEmail(ADMIN.email);
  const ana = porEmail('ana@educursos.com');
  const bruno = porEmail('bruno@educursos.com');

  // -------- categorias --------
  console.log('\nCategorias');
  for (const nome of ['Programação', 'Dados', 'Design']) {
    await criar(nome, '/categorias', { nome, descricao: `Cursos de ${nome.toLowerCase()}.` });
  }
  const categorias = await chamar('/categorias');
  const cat = (nome) => categorias.find((c) => c.nome === nome);

  // -------- cursos --------
  console.log('\nCursos');
  const cursosDesejados = [
    {
      titulo: 'NestJS do Zero',
      descricao: 'Construa uma API REST completa com NestJS, Prisma e PostgreSQL.',
      idCategoria: cat('Programação')?.idCategoria,
      nivel: 'Iniciante', totalAulas: 4, totalHoras: 12,
      dataPublicacao: '2026-03-10',
    },
    {
      titulo: 'React com TypeScript',
      descricao: 'Componentes, hooks, rotas e consumo de APIs na prática.',
      idCategoria: cat('Programação')?.idCategoria,
      nivel: 'Intermediário', totalAulas: 3, totalHoras: 10,
      dataPublicacao: '2026-04-02',
    },
    {
      titulo: 'SQL para Análise de Dados',
      descricao: 'Consultas, junções e agregações sobre bases reais.',
      idCategoria: cat('Dados')?.idCategoria,
      nivel: 'Iniciante', totalAulas: 2, totalHoras: 8,
      dataPublicacao: '2026-05-20',
    },
  ];

  const existentes = await chamar('/cursos');
  for (const curso of cursosDesejados) {
    if (existentes.some((c) => c.titulo === curso.titulo)) {
      console.log(`  = ${curso.titulo} (já existia)`);
      continue;
    }
    await criar(curso.titulo, '/cursos', { ...curso, idInstrutor: instrutor.idUsuario });
  }

  const cursos = await chamar('/cursos');
  const curso = (titulo) => cursos.find((c) => c.titulo === titulo);
  const nest = curso('NestJS do Zero');
  const react = curso('React com TypeScript');

  // -------- módulos e aulas --------
  console.log('\nMódulos e aulas');
  const modulosExistentes = await chamar('/modulos');
  const plano = [
    { curso: nest, titulo: 'Fundamentos', ordem: 1, aulas: [
      { titulo: 'O que é o NestJS', tipoConteudo: 'Video', duracaoMinutos: 14, ordem: 1 },
      { titulo: 'Controllers e rotas', tipoConteudo: 'Video', duracaoMinutos: 22, ordem: 2 },
    ]},
    { curso: nest, titulo: 'Persistência com Prisma', ordem: 2, aulas: [
      { titulo: 'Modelando o schema', tipoConteudo: 'Video', duracaoMinutos: 26, ordem: 1 },
      { titulo: 'Quiz do módulo', tipoConteudo: 'Quiz', duracaoMinutos: 10, ordem: 2 },
    ]},
    { curso: react, titulo: 'Componentes', ordem: 1, aulas: [
      { titulo: 'JSX e props', tipoConteudo: 'Video', duracaoMinutos: 18, ordem: 1 },
      { titulo: 'Estado com useState', tipoConteudo: 'Texto', duracaoMinutos: 12, ordem: 2 },
    ]},
  ];

  for (const bloco of plano) {
    if (!bloco.curso) continue;
    let modulo = modulosExistentes.find(
      (m) => m.idCurso === bloco.curso.idCurso && m.titulo === bloco.titulo,
    );
    if (!modulo) {
      modulo = await criar(bloco.titulo, '/modulos', {
        idCurso: bloco.curso.idCurso, titulo: bloco.titulo, ordem: bloco.ordem,
      });
    } else {
      console.log(`  = ${bloco.titulo} (já existia)`);
    }
    if (!modulo) continue;

    const aulasExistentes = await chamar('/aulas');
    for (const aula of bloco.aulas) {
      if (aulasExistentes.some((a) => a.idModulo === modulo.idModulo && a.titulo === aula.titulo)) {
        continue;
      }
      await criar(`aula: ${aula.titulo}`, '/aulas', { ...aula, idModulo: modulo.idModulo });
    }
  }

  // -------- trilha --------
  console.log('\nTrilhas');
  const trilhas = await chamar('/trilhas');
  let trilha = trilhas.find((t) => t.titulo === 'Desenvolvedor Full-stack');
  if (!trilha) {
    trilha = await criar('Desenvolvedor Full-stack', '/trilhas', {
      titulo: 'Desenvolvedor Full-stack',
      descricao: 'Do back-end ao front-end, na ordem certa.',
      idCategoria: cat('Programação').idCategoria,
    });
  }
  if (trilha) {
    const vinculos = await chamar('/trilhas-cursos');
    for (const [indice, alvo] of [nest, react].entries()) {
      if (!alvo) continue;
      if (vinculos.some((v) => v.idTrilha === trilha.idTrilha && v.idCurso === alvo.idCurso)) continue;
      await criar(`trilha → ${alvo.titulo}`, '/trilhas-cursos', {
        idTrilha: trilha.idTrilha, idCurso: alvo.idCurso, ordem: indice + 1,
      });
    }
  }

  // -------- matrículas, avaliações, progresso --------
  console.log('\nInteração');
  const matriculas = await chamar('/matriculas');
  for (const [aluno, alvo] of [[ana, nest], [bruno, nest], [ana, react]]) {
    if (!aluno || !alvo) continue;
    if (matriculas.some((m) => m.idUsuario === aluno.idUsuario && m.idCurso === alvo.idCurso)) continue;
    await criar(`matrícula ${aluno.nomeCompleto} → ${alvo.titulo}`, '/matriculas', {
      idUsuario: aluno.idUsuario, idCurso: alvo.idCurso,
    });
  }

  const avaliacoes = await chamar('/avaliacoes');
  for (const [aluno, alvo, nota, comentario] of [
    [ana, nest, 5, 'Explicação muito clara, do básico ao deploy.'],
    [bruno, nest, 4, 'Bom curso, senti falta de mais exercícios.'],
  ]) {
    if (!aluno || !alvo) continue;
    if (avaliacoes.some((a) => a.idUsuario === aluno.idUsuario && a.idCurso === alvo.idCurso)) continue;
    await criar(`avaliação ${nota}★`, '/avaliacoes', {
      idUsuario: aluno.idUsuario, idCurso: alvo.idCurso, nota, comentario,
    });
  }

  const aulasTodas = await chamar('/aulas');
  const progresso = await chamar('/progresso-aulas');
  for (const aula of aulasTodas.slice(0, 2)) {
    if (!ana) break;
    if (progresso.some((p) => p.idUsuario === ana.idUsuario && p.idAula === aula.idAula)) continue;
    await criar(`progresso ${ana.nomeCompleto} → ${aula.titulo}`, '/progresso-aulas', {
      idUsuario: ana.idUsuario, idAula: aula.idAula,
      dataConclusao: '2026-06-01', status: 'Concluido',
    });
  }

  // -------- certificados --------
  console.log('\nCertificados');
  const certificados = await chamar('/certificados');
  if (ana && nest && !certificados.some((c) => c.codigoVerificacao === 'CERT-2026-ANA01')) {
    await criar('CERT-2026-ANA01', '/certificados', {
      idUsuario: ana.idUsuario, idCurso: nest.idCurso,
      codigoVerificacao: 'CERT-2026-ANA01',
    });
  }

  // -------- planos, assinaturas, pagamentos --------
  console.log('\nFinanceiro');
  const planosExistentes = await chamar('/planos');
  for (const p of [
    { nome: 'Mensal', descricao: 'Acesso a todos os cursos por 1 mês.', preco: 39.9, duracaoMeses: 1 },
    { nome: 'Anual', descricao: 'Acesso a todos os cursos por 12 meses.', preco: 299.9, duracaoMeses: 12 },
  ]) {
    if (planosExistentes.some((existente) => existente.nome === p.nome)) {
      console.log(`  = ${p.nome} (já existia)`);
      continue;
    }
    await criar(p.nome, '/planos', p);
  }

  const planos = await chamar('/planos');
  const anual = planos.find((p) => p.nome === 'Anual');
  const assinaturas = await chamar('/assinaturas');
  let assinatura = assinaturas.find((a) => ana && a.idUsuario === ana.idUsuario);
  if (!assinatura && ana && anual) {
    assinatura = await criar('assinatura anual da Ana', '/assinaturas', {
      idUsuario: ana.idUsuario, idPlano: anual.idPlano,
      dataInicio: '2026-01-15', dataFim: '2027-01-15',
    });
  }

  const pagamentos = await chamar('/pagamentos');
  if (assinatura && !pagamentos.some((p) => p.idTransacaoGateway === 'TX-2026-000001')) {
    await criar('pagamento TX-2026-000001', '/pagamentos', {
      idAssinatura: assinatura.idAssinatura,
      valorPago: Number(anual.preco),
      metodoPagamento: 'Pix',
      idTransacaoGateway: 'TX-2026-000001',
    });
  }

  console.log('\nPronto. Duas contas para testar os dois lados:');
  console.log('  ADMIN  admin@educursos.com / senha123  -> cria, edita e exclui tudo');
  console.log('  ALUNO  ana@educursos.com   / senha123  -> só vê o catálogo e o que é dela');
}

main().catch((erro) => {
  console.error('\nFalhou:', erro.message);
  console.error('A API está no ar em ' + API + '? (npm run start:dev)');
  process.exit(1);
});
