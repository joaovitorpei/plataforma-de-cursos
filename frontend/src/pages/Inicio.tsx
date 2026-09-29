import { Link } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { useCarregamento } from '../hooks/useCarregamento';
import { Alerta, Botao, Carregando, Cartao, Selo } from '../components/ui';
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
  const [cursos, categorias, trilhas, matriculas, avaliacoes, certificados, planos, assinaturas] =
    await Promise.all([
      cursoService.listar(),
      categoriaService.listar(),
      trilhaService.listar(),
      matriculaService.listar(),
      avaliacaoService.listar(),
      certificadoService.listar(),
      planoService.listar(),
      assinaturaService.listar(),
    ]);

  return { cursos, categorias, trilhas, matriculas, avaliacoes, certificados, planos, assinaturas };
}

export function Inicio() {
  const { usuario } = useAuth();
  const { dados, erro, carregando, recarregar } = useCarregamento(carregarPainel);

  const primeiroNome = usuario?.nomeCompleto.split(' ')[0] ?? '';

  return (
    <div className="pilha-g">
      <section className="heroi">
        <h1>Olá, {primeiroNome}</h1>
        <p>
          Este painel lê direto do banco da plataforma. Cada número abaixo é uma
          consulta à API — atualize para ver o que mudou no PostgreSQL.
        </p>
        <div style={{ marginTop: 'var(--e-5)' }}>
          <Botao variante="secundario" onClick={() => void recarregar()} disabled={carregando}>
            {carregando ? 'Atualizando…' : '↻ Atualizar do banco'}
          </Botao>
        </div>
      </section>

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}

      {carregando && !dados ? <Carregando mensagem="Lendo o banco…" /> : null}

      {dados ? (
        <>
          <section className="indicadores">
            {[
              { rotulo: 'Cursos', valor: dados.cursos.length, para: '/cursos' },
              { rotulo: 'Categorias', valor: dados.categorias.length, para: '/categorias' },
              { rotulo: 'Trilhas', valor: dados.trilhas.length, para: '/trilhas' },
              { rotulo: 'Matrículas', valor: dados.matriculas.length, para: '/matriculas' },
              { rotulo: 'Avaliações', valor: dados.avaliacoes.length, para: '/avaliacoes' },
              { rotulo: 'Certificados', valor: dados.certificados.length, para: '/certificados' },
              { rotulo: 'Planos', valor: dados.planos.length, para: '/planos' },
              { rotulo: 'Assinaturas', valor: dados.assinaturas.length, para: '/assinaturas' },
            ].map((item) => (
              <Link key={item.rotulo} to={item.para} className="indicador" style={{ color: 'inherit' }}>
                <div className="indicador-valor">{item.valor}</div>
                <div className="indicador-rotulo">{item.rotulo}</div>
              </Link>
            ))}
          </section>

          <section>
            <div className="linha-entre" style={{ marginBottom: 'var(--e-4)' }}>
              <h2>Últimos cursos</h2>
              <Link to="/cursos">Ver todos</Link>
            </div>

            {dados.cursos.length === 0 ? (
              <Cartao>
                <p className="texto-secundario">
                  Nenhum curso cadastrado ainda.{' '}
                  <Link to="/cursos/novo">Cadastrar o primeiro</Link>
                </p>
              </Cartao>
            ) : (
              <div className="grade">
                {dados.cursos.slice(-6).reverse().map((curso) => (
                  <Link
                    key={curso.idCurso}
                    to={`/cursos/${curso.idCurso}`}
                    style={{ color: 'inherit' }}
                  >
                    <Cartao interativo>
                      <div className="linha" style={{ marginBottom: 'var(--e-2)' }}>
                        {curso.nivel ? <Selo cor="marca">{curso.nivel}</Selo> : null}
                        <span className="texto-terciario">{data(curso.dataPublicacao)}</span>
                      </div>
                      <p className="cartao-titulo">{curso.titulo}</p>
                      <p className="texto-secundario texto-pequeno">
                        {resumir(curso.descricao, 90) || 'Sem descrição.'}
                      </p>
                    </Cartao>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {dados.planos.length > 0 ? (
            <section>
              <div className="linha-entre" style={{ marginBottom: 'var(--e-4)' }}>
                <h2>Planos disponíveis</h2>
                <Link to="/planos">Gerenciar</Link>
              </div>
              <div className="grade">
                {dados.planos.map((plano) => (
                  <Cartao key={plano.idPlano}>
                    <p className="cartao-titulo">{plano.nome}</p>
                    <p style={{ fontSize: 'var(--t-lg)', fontFamily: 'var(--fonte-titulo)' }}>
                      {moeda(plano.preco)}
                    </p>
                    <p className="texto-terciario">
                      por {plano.duracaoMeses} {plano.duracaoMeses === 1 ? 'mês' : 'meses'}
                    </p>
                  </Cartao>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
