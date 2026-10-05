import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { useCarregamento } from '../hooks';
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  Carregando,
  Cartao,
  EstadoVazio,
  Estrelas,
  Selo,
  BarraProgresso,
} from '../components/ui';
import {
  aulaService,
  avaliacaoService,
  categoriaService,
  cursoService,
  consultarElegibilidade,
  emitirMeuCertificado,
  matriculaService,
  moduloService,
  listarUsuariosVisiveis,
} from '../services';
import { data, duracao } from '../utils/formato';
import { mensagemDeErro } from '../utils/erro';

export function CursoDetalhe() {
  const { id } = useParams();
  const idCurso = Number(id);
  const { usuario, ehEquipe } = useAuth();

  const [matriculando, setMatriculando] = useState(false);
  const [erroMatricula, setErroMatricula] = useState<string | null>(null);
  const [emitindo, setEmitindo] = useState(false);

  const carregar = useCallback(async () => {
    const [curso, modulos, aulas, avaliacoes, categorias, matriculas] =
      await Promise.all([
        cursoService.obter(idCurso),
        moduloService.listar(),
        aulaService.listar(),
        avaliacaoService.listar(),
        categoriaService.listar(),
        matriculaService.listar(),
      ]);

    const matriculado = matriculas.some(
      (m) => m.idCurso === idCurso && m.idUsuario === usuario?.idUsuario,
    );

    // A lista de usuários é restrita a professores; o aluno não precisa dela.
    const usuarios = ehEquipe ? await listarUsuariosVisiveis() : [];

    const modulosDoCurso = modulos
      .filter((modulo) => modulo.idCurso === idCurso)
      .sort((a, b) => a.ordem - b.ordem);

    const idsModulos = new Set(modulosDoCurso.map((modulo) => modulo.idModulo));

    return {
      curso,
      usuarios,
      categorias,
      modulos: modulosDoCurso,
      aulas: aulas
        .filter((aula) => idsModulos.has(aula.idModulo))
        .sort((a, b) => a.ordem - b.ordem),
      avaliacoes: avaliacoes.filter((a) => a.idCurso === idCurso),
      matriculado,
      // Só o aluno matriculado precisa disso; a equipe não emite para si.
      elegibilidade:
        !ehEquipe && matriculado
          ? await consultarElegibilidade(idCurso)
          : null,
    };
  }, [idCurso, ehEquipe, usuario?.idUsuario]);

  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  async function matricular() {
    if (!usuario) return;
    setErroMatricula(null);
    setMatriculando(true);
    try {
      await matriculaService.criar({
        idUsuario: usuario.idUsuario,
        idCurso,
      });
      await recarregar();
    } catch (excecao) {
      setErroMatricula(mensagemDeErro(excecao));
    } finally {
      setMatriculando(false);
    }
  }

  async function emitir() {
    if (!usuario) return;
    setErroMatricula(null);
    setEmitindo(true);
    try {
      await emitirMeuCertificado(usuario.idUsuario, idCurso);
      await recarregar();
    } catch (excecao) {
      setErroMatricula(mensagemDeErro(excecao));
    } finally {
      setEmitindo(false);
    }
  }

  if (carregando) return <Carregando />;
  if (erro) return <Alerta tipo="erro">{erro}</Alerta>;
  if (!dados?.curso) return <EstadoVazio titulo="Curso não encontrado" />;

  const {
    curso,
    modulos,
    aulas,
    avaliacoes,
    categorias,
    usuarios,
    matriculado,
    elegibilidade,
  } = dados;

  const categoria = categorias.find((c) => c.idCategoria === curso.idCategoria);
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
            <Link to="/cursos">
              <Botao variante="secundario">Voltar</Botao>
            </Link>
            {ehEquipe ? (
              <Link to={`/cursos/${curso.idCurso}/editar`}>
                <Botao>Editar</Botao>
              </Link>
            ) : null}
          </>
        }
      />

      <div className="linha">
        {categoria ? <Selo cor="marca">{categoria.nome}</Selo> : null}
        {curso.nivel ? <Selo>{curso.nivel}</Selo> : null}
        <span className="texto-terciario">
          {curso.instrutor ? `${curso.instrutor.nomeCompleto} · ` : ''}
          {curso.totalHoras ?? 0}h · publicado em {data(curso.dataPublicacao)}
        </span>
      </div>

      {/* Faixa de matrícula — só para aluno */}
      {!ehEquipe ? (
        <Cartao className={matriculado ? 'border-success' : 'border-primary'}>
          {erroMatricula ? (
            <div className="mb-3">
              <Alerta tipo="erro">{erroMatricula}</Alerta>
            </div>
          ) : null}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <p className="cartao-titulo mb-1">
                {matriculado ? (
                  <>
                    <i className="bi bi-check-circle-fill text-success me-1" />
                    Você está matriculado
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-1" />
                    Conteúdo bloqueado
                  </>
                )}
              </p>
              <p className="texto-secundario mb-0">
                {matriculado
                  ? 'As aulas deste curso estão liberadas para você.'
                  : 'Veja abaixo o que o curso ensina. Matricule-se para assistir às aulas.'}
              </p>
            </div>

            {matriculado ? (
              <Link to="/progresso">
                <Botao variante="secundario">Meu progresso</Botao>
              </Link>
            ) : (
              <Botao
                tamanho="grande"
                onClick={() => void matricular()}
                disabled={matriculando}
              >
                {matriculando ? 'Matriculando…' : 'Matricular-se'}
              </Botao>
            )}
          </div>

          {/* Certificado: aparece quando o aluno termina todas as aulas */}
          {matriculado && elegibilidade ? (
            <div className="border-top mt-3 pt-3">
              {elegibilidade.jaEmitido ? (
                <div className="linha-entre">
                  <span>
                    <i className="bi bi-patch-check-fill text-success me-1" />
                    Você já tem o certificado deste curso.
                  </span>
                  <Link to="/certificados">
                    <Botao variante="secundario" tamanho="pequeno">
                      Ver certificados
                    </Botao>
                  </Link>
                </div>
              ) : elegibilidade.concluiu ? (
                <div className="linha-entre">
                  <span>
                    <i className="bi bi-trophy-fill text-warning me-1" />
                    <strong>Curso concluído!</strong> Você já pode emitir o seu
                    certificado.
                  </span>
                  <Botao onClick={() => void emitir()} disabled={emitindo}>
                    {emitindo ? 'Emitindo…' : 'Emitir certificado'}
                  </Botao>
                </div>
              ) : (
                <div>
                  <BarraProgresso
                    valor={elegibilidade.aulasConcluidas}
                    total={elegibilidade.totalAulas}
                    rotulo="Aulas concluídas"
                  />
                  <p className="texto-terciario mb-0 mt-2">
                    Conclua todas as aulas em <strong>Meu progresso</strong>{' '}
                    para liberar o certificado.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </Cartao>
      ) : null}

      <section>
        <div className="linha-entre mb-3">
          <h2>Conteúdo</h2>
          {ehEquipe ? (
            <div className="linha">
              <Link to="/modulos/novo">
                <Botao variante="secundario" tamanho="pequeno">
                  Novo módulo
                </Botao>
              </Link>
              <Link to="/aulas/nova">
                <Botao variante="secundario" tamanho="pequeno">
                  Nova aula
                </Botao>
              </Link>
            </div>
          ) : null}
        </div>

        {modulos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum módulo neste curso"
            descricao="Os módulos organizam as aulas em blocos."
          />
        ) : (
          <div className="pilha">
            {modulos.map((modulo) => {
              const aulasDoModulo = aulas.filter(
                (aula) => aula.idModulo === modulo.idModulo,
              );
              return (
                <Cartao key={modulo.idModulo}>
                  <div className="linha-entre">
                    <p className="cartao-titulo mb-0">
                      <span className="texto-terciario mono">
                        {modulo.ordem}.
                      </span>{' '}
                      {modulo.titulo}
                    </p>
                    <span className="texto-terciario">
                      {aulasDoModulo.length}{' '}
                      {aulasDoModulo.length === 1 ? 'aula' : 'aulas'}
                    </span>
                  </div>

                  {aulasDoModulo.length > 0 ? (
                    <ul className="list-unstyled mt-3 mb-0">
                      {aulasDoModulo.map((aula) => (
                        <li
                          key={aula.idAula}
                          className="linha-entre py-2 border-top"
                        >
                          <span>
                            {/* O cadeado aparece quando a API não liberou o conteúdo */}
                            <i
                              className={`bi me-2 ${
                                aula.liberada
                                  ? 'bi-play-circle text-primary'
                                  : 'bi-lock text-body-tertiary'
                              }`}
                              aria-hidden="true"
                            />
                            <span className="texto-terciario mono">
                              {aula.ordem}.
                            </span>{' '}
                            {aula.titulo}
                          </span>

                          <span className="linha">
                            <Selo>{aula.tipoConteudo}</Selo>
                            <span className="texto-terciario">
                              {duracao(aula.duracaoMinutos)}
                            </span>
                            {aula.liberada && aula.urlConteudo ? (
                              <a
                                href={aula.urlConteudo}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Assistir
                              </a>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="texto-terciario mt-2 mb-0">
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
        <div className="linha-entre mb-3">
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
          <EstadoVazio
            titulo={
              ehEquipe
                ? 'Este curso ainda não foi avaliado'
                : 'Você ainda não avaliou este curso'
            }
            descricao={
              ehEquipe
                ? undefined
                : 'Só é possível ver as avaliações que você escreveu.'
            }
          />
        ) : (
          <div className="pilha">
            {avaliacoes.map((avaliacao) => {
              const autor = usuarios.find(
                (u) => u.idUsuario === avaliacao.idUsuario,
              );
              return (
                <Cartao key={avaliacao.idAvaliacao}>
                  <div className="linha-entre">
                    <strong>
                      {autor?.nomeCompleto ??
                        (avaliacao.idUsuario === usuario?.idUsuario
                          ? 'Você'
                          : `Usuário ${avaliacao.idUsuario}`)}
                    </strong>
                    <span className="linha">
                      <Estrelas nota={avaliacao.nota} />
                      <span className="texto-terciario">
                        {data(avaliacao.dataAvaliacao)}
                      </span>
                    </span>
                  </div>
                  {avaliacao.comentario ? (
                    <p className="texto-secundario mt-2 mb-0">
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
