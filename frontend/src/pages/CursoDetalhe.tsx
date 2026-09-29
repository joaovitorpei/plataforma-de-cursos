import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useCarregamento } from '../hooks';
import {
  Alerta, Botao, CabecalhoPagina, Carregando, Cartao, EstadoVazio, Estrelas, Selo,
} from '../components/ui';
import {
  aulaService, avaliacaoService, categoriaService, cursoService,
  moduloService, usuarioService,
} from '../services';
import { data, duracao } from '../utils/formato';

export function CursoDetalhe() {
  const { id } = useParams();
  const idCurso = Number(id);

  const carregar = useCallback(async () => {
    const [curso, modulos, aulas, avaliacoes, categorias, usuarios] = await Promise.all([
      cursoService.obter(idCurso),
      moduloService.listar(),
      aulaService.listar(),
      avaliacaoService.listar(),
      categoriaService.listar(),
      usuarioService.listar(),
    ]);

    // A API não filtra por query string: o recorte por curso é feito aqui.
    const modulosDoCurso = modulos
      .filter((m) => m.idCurso === idCurso)
      .sort((a, b) => a.ordem - b.ordem);

    const idsModulos = new Set(modulosDoCurso.map((m) => m.idModulo));

    return {
      curso,
      modulos: modulosDoCurso,
      aulas: aulas
        .filter((a) => idsModulos.has(a.idModulo))
        .sort((a, b) => a.ordem - b.ordem),
      avaliacoes: avaliacoes.filter((a) => a.idCurso === idCurso),
      categorias,
      usuarios,
    };
  }, [idCurso]);

  const { dados, erro, carregando } = useCarregamento(carregar);

  if (carregando) return <Carregando />;
  if (erro) return <Alerta tipo="erro">{erro}</Alerta>;
  if (!dados?.curso) return <EstadoVazio titulo="Curso não encontrado" />;

  const { curso, modulos, aulas, avaliacoes, categorias, usuarios } = dados;

  const categoria = categorias.find((c) => c.idCategoria === curso.idCategoria);
  const instrutor = usuarios.find((u) => u.idUsuario === curso.idInstrutor);
  const media =
    avaliacoes.length > 0
      ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length
      : 0;

  return (
    <div className="pilha-g">
      <CabecalhoPagina
        titulo={curso.titulo}
        descricao={curso.descricao ?? undefined}
        acao={
          <>
            <Link to="/cursos"><Botao variante="secundario">Voltar</Botao></Link>
            <Link to={`/cursos/${curso.idCurso}/editar`}><Botao>Editar</Botao></Link>
          </>
        }
      />

      <div className="linha" style={{ flexWrap: 'wrap' }}>
        {categoria ? <Selo cor="marca">{categoria.nome}</Selo> : null}
        {curso.nivel ? <Selo>{curso.nivel}</Selo> : null}
        <span className="texto-terciario">
          {instrutor?.nomeCompleto ?? 'Instrutor não encontrado'} ·{' '}
          {curso.totalHoras ?? 0}h · publicado em {data(curso.dataPublicacao)}
        </span>
      </div>

      <section>
        <div className="linha-entre" style={{ marginBottom: 'var(--e-4)' }}>
          <h2>Conteúdo</h2>
          <div className="linha">
            <Link to="/modulos/novo"><Botao variante="secundario" tamanho="pequeno">Novo módulo</Botao></Link>
            <Link to="/aulas/nova"><Botao variante="secundario" tamanho="pequeno">Nova aula</Botao></Link>
          </div>
        </div>

        {modulos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum módulo neste curso"
            descricao="Os módulos organizam as aulas em blocos."
          />
        ) : (
          <div className="pilha">
            {modulos.map((modulo) => {
              const aulasDoModulo = aulas.filter((a) => a.idModulo === modulo.idModulo);
              return (
                <Cartao key={modulo.idModulo}>
                  <div className="linha-entre">
                    <p className="cartao-titulo" style={{ margin: 0 }}>
                      <span className="texto-terciario mono">{modulo.ordem}.</span>{' '}
                      {modulo.titulo}
                    </p>
                    <span className="texto-terciario">
                      {aulasDoModulo.length} {aulasDoModulo.length === 1 ? 'aula' : 'aulas'}
                    </span>
                  </div>

                  {aulasDoModulo.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--e-3)' }}>
                      {aulasDoModulo.map((aula) => (
                        <li
                          key={aula.idAula}
                          className="linha-entre"
                          style={{
                            padding: 'var(--e-2) 0',
                            borderTop: '1px solid var(--borda)',
                          }}
                        >
                          <span>
                            <span className="texto-terciario mono">{aula.ordem}.</span>{' '}
                            {aula.titulo}
                          </span>
                          <span className="linha">
                            <Selo>{aula.tipoConteudo}</Selo>
                            <span className="texto-terciario">
                              {duracao(aula.duracaoMinutos)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="texto-terciario" style={{ marginTop: 'var(--e-2)' }}>
                      Sem aulas neste módulo.
                    </p>
                  )}
                </Cartao>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="linha-entre" style={{ marginBottom: 'var(--e-4)' }}>
          <h2>Avaliações</h2>
          {avaliacoes.length > 0 ? (
            <span className="linha">
              <Estrelas nota={Math.round(media)} />
              <span className="texto-secundario">
                {media.toFixed(1)} · {avaliacoes.length}{' '}
                {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'}
              </span>
            </span>
          ) : null}
        </div>

        {avaliacoes.length === 0 ? (
          <EstadoVazio titulo="Este curso ainda não foi avaliado" />
        ) : (
          <div className="pilha">
            {avaliacoes.map((avaliacao) => {
              const autor = usuarios.find((u) => u.idUsuario === avaliacao.idUsuario);
              return (
                <Cartao key={avaliacao.idAvaliacao}>
                  <div className="linha-entre">
                    <strong>{autor?.nomeCompleto ?? `Usuário ${avaliacao.idUsuario}`}</strong>
                    <span className="linha">
                      <Estrelas nota={avaliacao.nota} />
                      <span className="texto-terciario">{data(avaliacao.dataAvaliacao)}</span>
                    </span>
                  </div>
                  {avaliacao.comentario ? (
                    <p className="texto-secundario" style={{ marginTop: 'var(--e-2)' }}>
                      {avaliacao.comentario}
                    </p>
                  ) : null}
                </Cartao>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
