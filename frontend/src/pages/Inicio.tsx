import { Link } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { useCarregamento } from '../hooks/useCarregamento';
import { Alerta, Carregando, Cartao, Selo } from '../components/ui';
import {
  assinaturaService,
  avaliacaoService,
  categoriaService,
  certificadoService,
  cursoService,
  matriculaService,
  planoService,
  trilhaService,
} from '../services';
import { data, moeda, resumir } from '../utils/formato';

/** Carrega de uma vez os números que resumem a plataforma. */
async function carregarPainel() {
  const [
    cursos,
    categorias,
    trilhas,
    matriculas,
    avaliacoes,
    certificados,
    planos,
    assinaturas,
  ] = await Promise.all([
    cursoService.listar(),
    categoriaService.listar(),
    trilhaService.listar(),
    matriculaService.listar(),
    avaliacaoService.listar(),
    certificadoService.listar(),
    planoService.listar(),
    assinaturaService.listar(),
  ]);

  return {
    cursos,
    categorias,
    trilhas,
    matriculas,
    avaliacoes,
    certificados,
    planos,
    assinaturas,
  };
}

export function Inicio() {
  const { usuario, ehAdmin } = useAuth();
  const { dados, erro, carregando } = useCarregamento(carregarPainel);

  const primeiroNome = usuario?.nomeCompleto.split(' ')[0] ?? '';

  return (
    <div className="pilha-g">
      <section className="heroi">
        <h1>Olá, {primeiroNome}</h1>
        <p>
          {ehAdmin
            ? 'Mantenha o catálogo da plataforma e acompanhe o andamento dos alunos.'
            : 'Seus cursos, matrículas e certificados em um só lugar. Explore o catálogo e continue de onde parou.'}
        </p>
      </section>

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}

      {carregando && !dados ? <Carregando mensagem="Lendo o banco…" /> : null}

      {dados ? (
        <>
          {/* Grid do Bootstrap: 2 colunas no celular, 4 no tablet, 8 no desktop */}
          <section className="row row-cols-2 row-cols-md-4 g-3">
            {(ehAdmin
              ? [
                  {
                    rotulo: 'Cursos',
                    valor: dados.cursos.length,
                    para: '/cursos',
                  },
                  {
                    rotulo: 'Categorias',
                    valor: dados.categorias.length,
                    para: '/categorias',
                  },
                  {
                    rotulo: 'Trilhas',
                    valor: dados.trilhas.length,
                    para: '/trilhas',
                  },
                  {
                    rotulo: 'Matrículas',
                    valor: dados.matriculas.length,
                    para: '/matriculas',
                  },
                  {
                    rotulo: 'Avaliações',
                    valor: dados.avaliacoes.length,
                    para: '/avaliacoes',
                  },
                  {
                    rotulo: 'Certificados',
                    valor: dados.certificados.length,
                    para: '/certificados',
                  },
                  {
                    rotulo: 'Planos',
                    valor: dados.planos.length,
                    para: '/planos',
                  },
                  {
                    rotulo: 'Assinaturas',
                    valor: dados.assinaturas.length,
                    para: '/assinaturas',
                  },
                ]
              : [
                  // Para o aluno os números são os dele: a API já filtra.
                  {
                    rotulo: 'Cursos no catálogo',
                    valor: dados.cursos.length,
                    para: '/cursos',
                  },
                  {
                    rotulo: 'Trilhas',
                    valor: dados.trilhas.length,
                    para: '/trilhas',
                  },
                  {
                    rotulo: 'Minhas matrículas',
                    valor: dados.matriculas.length,
                    para: '/matriculas',
                  },
                  {
                    rotulo: 'Minhas avaliações',
                    valor: dados.avaliacoes.length,
                    para: '/avaliacoes',
                  },
                  {
                    rotulo: 'Meus certificados',
                    valor: dados.certificados.length,
                    para: '/certificados',
                  },
                  {
                    rotulo: 'Minhas assinaturas',
                    valor: dados.assinaturas.length,
                    para: '/assinaturas',
                  },
                ]
            ).map((item) => (
              <div className="col" key={item.rotulo}>
                <Link
                  to={item.para}
                  className="indicador card h-100 card-interativo"
                >
                  <div className="card-body">
                    <div className="indicador-valor">{item.valor}</div>
                    <div className="indicador-rotulo">{item.rotulo}</div>
                  </div>
                </Link>
              </div>
            ))}
          </section>

          <section>
            <div className="linha-entre" style={{ marginBottom: 'var(--e-4)' }}>
              <h2>Últimos cursos</h2>
              <Link to="/cursos">Ver todos</Link>
            </div>

            {dados.cursos.length === 0 ? (
              <Cartao>
                <p className="texto-secundario mb-0">
                  {ehAdmin ? (
                    <>
                      Nenhum curso cadastrado ainda.{' '}
                      <Link to="/cursos/novo">Cadastrar o primeiro</Link>
                    </>
                  ) : (
                    'Ainda não há cursos no catálogo. Volte mais tarde.'
                  )}
                </p>
              </Cartao>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                {dados.cursos
                  .slice(-6)
                  .reverse()
                  .map((curso) => (
                    <div className="col" key={curso.idCurso}>
                      <Link
                        to={`/cursos/${curso.idCurso}`}
                        className="text-decoration-none text-body d-block h-100"
                      >
                        <Cartao interativo className="h-100">
                          <div className="linha mb-2">
                            {curso.nivel ? (
                              <Selo cor="marca">{curso.nivel}</Selo>
                            ) : null}
                            <span className="texto-terciario">
                              {data(curso.dataPublicacao)}
                            </span>
                          </div>
                          <p className="cartao-titulo">{curso.titulo}</p>
                          <p className="texto-secundario texto-pequeno mb-0">
                            {resumir(curso.descricao, 90) || 'Sem descrição.'}
                          </p>
                        </Cartao>
                      </Link>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {dados.planos.length > 0 ? (
            <section>
              <div
                className="linha-entre"
                style={{ marginBottom: 'var(--e-4)' }}
              >
                <h2>Planos disponíveis</h2>
                <Link to="/planos">{ehAdmin ? 'Gerenciar' : 'Ver todos'}</Link>
              </div>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                {dados.planos.map((plano) => (
                  <div className="col" key={plano.idPlano}>
                    <Cartao className="h-100">
                      <p className="cartao-titulo">{plano.nome}</p>
                      <p className="titulo fs-4 mb-1">{moeda(plano.preco)}</p>
                      <p className="texto-terciario mb-0">
                        por {plano.duracaoMeses}{' '}
                        {plano.duracaoMeses === 1 ? 'mês' : 'meses'}
                      </p>
                    </Cartao>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
